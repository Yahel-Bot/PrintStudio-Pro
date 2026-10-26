import os
import sys
import json
import tempfile

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import comtypes.client
import fitz  # PyMuPDF
import cv2
import numpy as np

def analizar_imagen(img_path):
    """
    Analiza una imagen usando OpenCV para determinar cobertura de tinta,
    si es color y si es de alta densidad de negro.
    """
    try:
        img = cv2.imread(img_path)
        if img is None:
            return {"esColor": False, "cobertura": 0.0, "esAltaDensidadBN": False}
        
        # Redimensionar para acelerar el procesamiento
        h_orig, w_orig = img.shape[:2]
        w_new = 400
        h_new = int(w_new * h_orig / w_orig)
        img_resized = cv2.resize(img, (w_new, h_new))
        
        # Analizar pixeles
        # Fondo blanco: pixeles muy claros (>245 en todos los canales BGR)
        # OpenCV usa BGR por defecto
        b, g, r = cv2.split(img_resized)
        non_white_mask = (b < 245) | (g < 245) | (r < 245)
        non_white_pixels = np.sum(non_white_mask)
        total_pixels = w_new * h_new
        
        if non_white_pixels == 0:
            return {"esColor": False, "cobertura": 0.0, "esAltaDensidadBN": False}
            
        # Convertir a HSV para evaluar la saturación y el valor (brillo)
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
        h_ch, s_ch, v_ch = cv2.split(hsv)
        
        # Pixeles de color: tienen saturación mayor a un umbral (s_ch > 25)
        color_mask = non_white_mask & (s_ch > 25)
        color_pixels = np.sum(color_mask)
        
        cobertura = (non_white_pixels / total_pixels) * 100
        pct_color = (color_pixels / non_white_pixels) * 100 if non_white_pixels > 0 else 0
        es_color = pct_color > 2.0  # Más del 2% del contenido impreso es color
        
        # Negro de alta densidad: pixeles oscuros (<100 en valor de brillo) y no color
        grey_mask = non_white_mask & (s_ch <= 25)
        dark_grey_mask = grey_mask & (v_ch < 100)
        high_density_black_pixels = np.sum(dark_grey_mask)
        
        # Si es B/N y más del 40% de la hoja está impresa, o más del 60% del contenido impreso es negro denso
        es_alta_densidad_bn = not es_color and (cobertura > 40.0 or (high_density_black_pixels / non_white_pixels) > 0.6)
        
        return {
            "cobertura": round(float(cobertura), 2),
            "esColor": bool(es_color),
            "pctColor": round(float(pct_color), 2),
            "esAltaDensidadBN": bool(es_alta_densidad_bn)
        }
    except Exception as e:
        # Fallback en caso de error de análisis
        return {"esColor": False, "cobertura": 5.0, "esAltaDensidadBN": False, "error": str(e)}

def convert_to_images(input_path, output_parent_dir=None):
    ext = os.path.splitext(input_path)[1].lower()
    if output_parent_dir and os.path.exists(output_parent_dir):
        temp_dir = tempfile.mkdtemp(dir=output_parent_dir)
    else:
        temp_dir = tempfile.mkdtemp()
        
    pdf_path = os.path.join(temp_dir, "temp.pdf")
    
    is_temp_pdf = False
    
    try:
        if ext == ".docx" or ext == ".doc":
            word = None
            doc = None
            try:
                word = comtypes.client.CreateObject('Word.Application')
                word.Visible = False
                word.DisplayAlerts = 0
                doc = word.Documents.Open(os.path.abspath(input_path), ReadOnly=True)
                doc.SaveAs(os.path.abspath(pdf_path), FileFormat=17) # 17 is wdFormatPDF
                is_temp_pdf = True
            finally:
                if doc:
                    try: doc.Close(SaveChanges=False)
                    except: pass
                if word:
                    try: word.Quit()
                    except: pass
        elif ext == ".pptx" or ext == ".ppt":
            powerpoint = None
            pres = None
            try:
                powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
                pres = powerpoint.Presentations.Open(os.path.abspath(input_path), WithWindow=False, ReadOnly=True)
                pres.SaveAs(os.path.abspath(pdf_path), 32) # 32 is ppSaveAsPDF
                is_temp_pdf = True
            finally:
                if pres:
                    try: pres.Close()
                    except: pass
                if powerpoint:
                    try: powerpoint.Quit()
                    except: pass
        elif ext == ".xlsx" or ext == ".xls":
            excel = None
            wb = None
            try:
                excel = comtypes.client.CreateObject("Excel.Application")
                excel.Visible = False
                excel.DisplayAlerts = False
                wb = excel.Workbooks.Open(os.path.abspath(input_path), ReadOnly=True)
                wb.ExportAsFixedFormat(0, os.path.abspath(pdf_path)) # 0 is xlTypePDF
                is_temp_pdf = True
            finally:
                if wb:
                    try: wb.Close(SaveChanges=False)
                    except: pass
                if excel:
                    try: excel.Quit()
                    except: pass
        elif ext == ".pdf":
            pdf_path = input_path
        else:
            return {"status": "error", "message": f"Formato no soportado: {ext}"}
        
        # Cargar con PyMuPDF
        if not os.path.exists(pdf_path):
            return {"status": "error", "message": f"No se pudo generar el archivo temporal PDF para: {input_path}"}

        doc = fitz.open(pdf_path)
        pages_data = []
        
        for i in range(len(doc)):
            page = doc[i]
            # Renderizar página a imagen PNG (150 DPI)
            pix = page.get_pixmap(dpi=150)
            p = os.path.join(temp_dir, f"page_{i}.png")
            pix.save(p)
            
            # Analizar el color/cobertura de la página renderizada
            analisis = analizar_imagen(p)
            
            pages_data.append({
                "image_path": p,
                "esColor": analisis["esColor"],
                "cobertura": analisis["cobertura"],
                "esAltaDensidadBN": analisis["esAltaDensidadBN"],
                "pctColor": analisis.get("pctColor", 0.0)
            })
            
        doc.close()

        # Si se usó un PDF intermedio, limpiarlo
        if is_temp_pdf and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except:
                pass
        
        return {"status": "success", "pages": pages_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path = sys.argv[1]
        out_dir = sys.argv[2] if len(sys.argv) > 2 else None
        result = convert_to_images(path, out_dir)
        print(json.dumps(result))
