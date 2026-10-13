"""Package the current build as a Decky plugin ZIP; run pnpm build first."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text())['version']
if not (root / 'dist/index.js').is_file():
    raise SystemExit('Missing dist/index.js. Run pnpm build first.')
output = root / 'release' / f'Installed-Home-{version}.zip'
output.parent.mkdir(exist_ok=True)
directories = {'src', 'tests', 'docs', 'licenses', 'third_party', 'dist', 'assets', 'scripts'}
files = {'plugin.json', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
         'tsconfig.json', 'rollup.config.js', 'main.py', 'README.md', 'NOTICE.md',
         'LICENSE', 'CONTRIBUTING.md', 'CHANGELOG.md'}
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob('*')):
        relative = path.relative_to(root)
        if not path.is_file() or '__pycache__' in relative.parts or path.suffix == '.pyc':
            continue
        if relative.parts[0] in directories or str(relative) in files:
            archive.write(path, Path('installed-home') / relative)
print(output)
