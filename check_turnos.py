import json

with open('frontend/public/turnos.json', 'r') as f:
    data = json.load(f)

print(f'Total de turnos: {len(data)}')
print()

# Contar por tipo
cc = [t for t in data if 'CC' in t['codigo']]
tt = [t for t in data if 'TT' in t['codigo']]
m_series = [t for t in data if t['codigo'][0] in '23' and 'TT' not in t['codigo'] and 'CC' not in t['codigo']]
other = [t for t in data if t not in cc and t not in tt and t not in m_series]

print(f'CC (festivos): {len(cc)}')
print(f'TT (ordinarios): {len(tt)}')
print(f'M (ordinarios): {len(m_series)}')
print(f'Otros: {len(other)}')
if other:
    otros_codigos = [t['codigo'] for t in other]
    print(f'  Códigos otros: {otros_codigos}')

print()
print(f'Total: {len(cc) + len(tt) + len(m_series) + len(other)}')

# Verificar duplicados
codigos = [t['codigo'] for t in data]
unicos = len(set(codigos))
print(f'Códigos únicos: {unicos}')
if len(codigos) != unicos:
    from collections import Counter
    duplicados = [cod for cod, count in Counter(codigos).items() if count > 1]
    print(f'Códigos duplicados: {duplicados}')
