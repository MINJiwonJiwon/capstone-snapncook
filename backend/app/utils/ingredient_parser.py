# backend/app/utils/ingredient_parser.py

import re
from typing import List

def remove_units(s: str) -> str:
    # 단위 패턴 제거 (g, ml, L, T, tsp 등)
    return re.sub(r'\b(?:g|ml|L|tsp|T|kg|꼬집|큰술|작은술|숟가락|컵|인분|알|장|개|줄|공기|모|대|단|쪽|스푼)\b', '', s)

def normalize_name(name: str) -> str:
    # 흔한 접두 수식어 제거 및 임의 제거어 필터링
    name = re.sub(r'^(자른|손질한|국산|수입산|말린|건|냉동|생물)', '', name)
    for word in ['약간', '재료', '재료:', '재료：', '넉넉히', '생물']:
        name = name.replace(word, '')
    return name.strip()

def parse_openapi_ingredients(raw: str) -> List[str]:
    lines = raw.splitlines()
    items: List[str] = []

    for line in lines:
        if ':' in line:
            line = line.split(':', 1)[1]
        elif '：' in line:
            line = line.split('：', 1)[1]
        elif 'ㆍ' in line:
            line = line.split('ㆍ', 1)[-1]

        for part in line.split(','):
            name = re.sub(r'\(.*?\)', '', part).strip()
            name = re.sub(r'[•ㆍ·:：]', '', name)
            name = remove_units(name)
            name = normalize_name(name)
            if name:
                items.append(name)

    return list(set(items))

def parse_agricook_ingredients(raw: str) -> List[str]:
    raw = raw.replace('\x07', '|')
    segments = raw.split('|')
    names: List[str] = []
    for s in segments:
        s = re.sub(r'\[.*?\]', '', s)
        s = re.sub(r'\(.*?\)', '', s)
        s = re.sub(r'\d+[^\s]*', '', s)
        s = remove_units(s)
        s = normalize_name(s)
        if s:
            names.append(s)
    return list(set(names))
