#!/usr/bin/env python3
"""
scripts/publish_release.py

Controlled Release Publisher for PrintStudio Pro (Python edition).
Ensures that ONLY explicitly approved releases trigger the GitHub Actions
release workflow via semantic git tags (e.g. v1.0.4).

Usage:
    python scripts/publish_release.py                 (Interactive mode)
    python scripts/publish_release.py patch           (Increment patch)
    python scripts/publish_release.py minor           (Increment minor)
    python scripts/publish_release.py 1.0.5           (Explicit version)
    python scripts/publish_release.py --dry-run       (Simulate without changes)
"""

import os
import sys
import json
import re
import subprocess
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKAGE_PATH = os.path.join(ROOT_DIR, "package.json")
PACKAGE_LOCK_PATH = os.path.join(ROOT_DIR, "package-lock.json")
VERSION_JSON_PATH = os.path.join(ROOT_DIR, "version.json")


def run_cmd(cmd, silent=False):
    res = subprocess.run(
        cmd,
        cwd=ROOT_DIR,
        shell=True,
        stdout=subprocess.PIPE if silent else None,
        stderr=subprocess.PIPE if silent else None,
        text=True,
        check=True
    )
    return res.stdout.strip() if silent and res.stdout else ""


def run_cmd_output(cmd):
    try:
        res = subprocess.run(cmd, cwd=ROOT_DIR, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return res.stdout.strip()
    except Exception:
        return ""


def parse_semver(v):
    clean = re.sub(r"^v", "", v.strip(), flags=re.IGNORECASE)
    parts = clean.split(".")
    major = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
    minor = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    patch = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 0
    return major, minor, patch


def bump_version(current, bump_type):
    major, minor, patch = parse_semver(current)
    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    elif bump_type == "patch":
        return f"{major}.{minor}.{patch + 1}"
    clean = re.sub(r"^v", "", bump_type.strip(), flags=re.IGNORECASE)
    if re.match(r"^\d+\.\d+\.\d+$", clean):
        return clean
    raise ValueError(f"Tipo de versión no reconocido: {bump_type}")


def main():
    print("\n========================================================================")
    print("  🚀 PRINTSTUDIO PRO — CONTROLLED GITHUB RELEASE PUBLISHER (PYTHON)")
    print("========================================================================\n")

    if not os.path.exists(PACKAGE_PATH):
        print("❌ Error: No se encontró package.json en el proyecto.", file=sys.stderr)
        sys.exit(1)

    with open(PACKAGE_PATH, "r", encoding="utf-8") as f:
        pkg = json.load(f)

    current_version = pkg.get("version", "1.0.0")
    print(f"📌 Versión actual del proyecto: v{current_version}")

    args = sys.argv[1:]
    is_dry_run = "--dry-run" in args
    auto_confirm = "--yes" in args or "-y" in args

    release_notes_arg = ""
    if "--notes" in args:
        idx = args.index("--notes")
        if idx + 1 < len(args):
            release_notes_arg = args[idx + 1]

    bump_arg = None
    for a in args:
        if not a.startswith("--"):
            if a in ["patch", "minor", "major"] or re.match(r"^v?\d+\.\d+\.\d+$", a):
                bump_arg = a
                break

    if bump_arg:
        target_version = bump_version(current_version, bump_arg)
    else:
        print("\nSelecciona el tipo de incremento:")
        print(f"  [1] Patch : {bump_version(current_version, 'patch')} (Correcciones y ajustes)")
        print(f"  [2] Minor : {bump_version(current_version, 'minor')} (Nuevas características)")
        print(f"  [3] Major : {bump_version(current_version, 'major')} (Cambios mayores)")
        print(f"  [4] Manual: Especificar versión personalizada")

        try:
            choice = input("\nIngresa una opción (1-4) [default: 1]: ").strip() or "1"
        except (KeyboardInterrupt, EOFError):
            print("\nOperación cancelada.")
            sys.exit(0)

        if choice == "1":
            target_version = bump_version(current_version, "patch")
        elif choice == "2":
            target_version = bump_version(current_version, "minor")
        elif choice == "3":
            target_version = bump_version(current_version, "major")
        elif choice == "4":
            manual = input("Ingresa la versión exacta (ej. 1.0.4): ").strip()
            target_version = bump_version(current_version, manual)
        else:
            target_version = bump_version(current_version, "patch")

    tag_name = f"v{target_version}"

    # Changelog notes
    release_notes = release_notes_arg
    if not release_notes:
        last_tag = run_cmd_output("git describe --tags --abbrev=0 2>nul")
        if last_tag:
            recent_commits = run_cmd_output(f"git log {last_tag}..HEAD --oneline 2>nul")
        else:
            recent_commits = run_cmd_output("git log -n 5 --oneline 2>nul")

        if recent_commits:
            print("\nCommits recientes detectados:")
            for l in recent_commits.splitlines():
                print(f"  • {l}")

        try:
            notes_input = input(f"\nDescribe las novedades de {tag_name}: ").strip()
            release_notes = notes_input if notes_input else f"PrintStudio Pro {tag_name}"
        except (KeyboardInterrupt, EOFError):
            print("\nOperación cancelada.")
            sys.exit(0)

    # Git status
    git_status = run_cmd_output("git status --porcelain")
    current_branch = run_cmd_output("git rev-parse --abbrev-ref HEAD") or "main"
    remote_url = run_cmd_output("git remote get-url origin") or "origin"

    print("\n========================================================================")
    print("                  RESUMEN DE PUBLICACIÓN DE RELEASE")
    print("========================================================================")
    print(f"  Versión Anterior:     {current_version}")
    print(f"  Nueva Versión:        {target_version}")
    print(f"  Tag Git a crear:      {tag_name}")
    print(f"  Rama Git destino:     {current_branch}")
    print(f"  Remoto GitHub:        {remote_url}")
    print(f"  Notas del Release:    {release_notes}")
    print(f"  Disparador CI/CD:     GitHub Actions (.github/workflows/release.yml)")
    print(f"  Modo Simulación:      {'ACTIVADO (--dry-run)' if is_dry_run else 'DESACTIVADO (Real)'}")
    print("========================================================================")

    if git_status:
        print("\n⚠️  Hay cambios locales en el repositorio:")
        for line in git_status.splitlines()[:8]:
            print(f"   {line}")

    if is_dry_run:
        print("\n🔍 [DRY-RUN] Simulación completada. No se modificaron archivos ni se ejecutó git push.")
        sys.exit(0)

    if not auto_confirm:
        try:
            confirm = input("\n⚠️  ¿Autorizas crear el tag y hacer push a GitHub para iniciar la compilación? (s/n): ").strip().lower()
            if confirm not in ["s", "si", "y", "yes"]:
                print("\n❌ Publicación CANCELADA por el desarrollador. No se enviaron cambios a GitHub.\n")
                sys.exit(0)
        except (KeyboardInterrupt, EOFError):
            print("\nOperación cancelada.")
            sys.exit(0)

    print("\n🚀 Procediendo con el lanzamiento autorizado...")

    # Actualizar package.json
    pkg["version"] = target_version
    with open(PACKAGE_PATH, "w", encoding="utf-8") as f:
        json.dump(pkg, f, indent=2)
        f.write("\n")
    print(f"  ✔ Actualizado package.json a {target_version}")

    # Actualizar package-lock.json
    if os.path.exists(PACKAGE_LOCK_PATH):
        try:
            with open(PACKAGE_LOCK_PATH, "r", encoding="utf-8") as f:
                lock = json.load(f)
            lock["version"] = target_version
            if "packages" in lock and "" in lock["packages"]:
                lock["packages"][""]["version"] = target_version
            with open(PACKAGE_LOCK_PATH, "w", encoding="utf-8") as f:
                json.dump(lock, f, indent=2)
                f.write("\n")
            print(f"  ✔ Actualizado package-lock.json a {target_version}")
        except Exception as e:
            print(f"  ⚠ Advertencia en package-lock.json: {e}")

    # Actualizar version.json
    if os.path.exists(VERSION_JSON_PATH):
        try:
            with open(VERSION_JSON_PATH, "r", encoding="utf-8") as f:
                vj = json.load(f)
            vj["version"] = target_version
            vj["releaseDate"] = datetime.now().strftime("%Y-%m-%d")
            with open(VERSION_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(vj, f, indent=2)
                f.write("\n")
            print(f"  ✔ Actualizado version.json a {target_version}")
        except Exception as e:
            print(f"  ⚠ Advertencia en version.json: {e}")

    # Git commit, tag & push
    try:
        print("\n📦 Registrando versión en Git...")
        run_cmd("git add package.json package-lock.json version.json 2>nul || git add package.json")
        staged = run_cmd_output("git diff --staged --name-only")
        if staged:
            run_cmd(f'git commit -m "chore(release): {tag_name}"')
            print(f'  ✔ Commit creado: "chore(release): {tag_name}"')

        escaped_notes = release_notes.replace('"', '\\"')
        run_cmd(f'git tag -a {tag_name} -m "Release {tag_name}: {escaped_notes}"')
        print(f"  ✔ Tag {tag_name} creado")

        print(f"\n📤 Enviando commit y tag a GitHub ({remote_url})...")
        run_cmd(f"git push origin {current_branch}")
        run_cmd(f"git push origin {tag_name}")

        print("\n========================================================================")
        print(f"  ✨ ¡Lanzamiento de {tag_name} iniciado exitosamente!")
        print("========================================================================")
        print(f"  • Tag publicado:        {tag_name}")
        print(f"  • GitHub Actions:       https://github.com/Yahel-Bot/PrintStudio-Pro/actions")
        print(f"  • GitHub Releases:      https://github.com/Yahel-Bot/PrintStudio-Pro/releases")
        print("========================================================================\n")
    except subprocess.CalledProcessError as err:
        print(f"\n❌ Error durante las operaciones de Git: {err}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
