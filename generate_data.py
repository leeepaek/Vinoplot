import os
import json

villages = {
    # Chablis
    "chablis": {"name": "Chablis", "koreanName": "샤블리", "region": "Chablis"},

    # Côte de Nuits
    "marsannay": {"name": "Marsannay", "koreanName": "마르사네", "region": "Côte de Nuits"},
    "fixin": {"name": "Fixin", "koreanName": "픽생", "region": "Côte de Nuits"},
    "gevrey-chambertin": {"name": "Gevrey-Chambertin", "koreanName": "쥬브레 샹베르텡", "region": "Côte de Nuits"},
    "morey-saint-denis": {"name": "Morey-Saint-Denis", "koreanName": "모레 생 드니", "region": "Côte de Nuits"},
    "chambolle-musigny": {"name": "Chambolle-Musigny", "koreanName": "샹볼 뮈지니", "region": "Côte de Nuits"},
    "vougeot": {"name": "Vougeot", "koreanName": "부조", "region": "Côte de Nuits"},
    "vosne-romanee": {"name": "Vosne-Romanée", "koreanName": "본 로마네", "region": "Côte de Nuits"},
    "nuits-saint-georges": {"name": "Nuits-Saint-Georges", "koreanName": "뉘 생 조르주", "region": "Côte de Nuits"},
    "flagey-echezeaux": {"name": "Flagey-Echézeaux", "koreanName": "플라제 에세조", "region": "Côte de Nuits"}, # Corrected region

    # Côte de Beaune
    "aloxe-corton": {"name": "Aloxe-Corton", "koreanName": "알록스 코르통", "region": "Côte de Beaune"},
    "pernand-vergelesses": {"name": "Pernand-Vergelesses", "koreanName": "페르낭 베르즐레스", "region": "Côte de Beaune"},
    "savigny-les-beaune": {"name": "Savigny-lès-Beaune", "koreanName": "사비니 레 본", "region": "Côte de Beaune"},
    "beaune": {"name": "Beaune", "koreanName": "본", "region": "Côte de Beaune"},
    "pommard": {"name": "Pommard", "koreanName": "포마르", "region": "Côte de Beaune"},
    "volnay": {"name": "Volnay", "koreanName": "볼네", "region": "Côte de Beaune"},
    "meursault": {"name": "Meursault", "koreanName": "뫼르소", "region": "Côte de Beaune"},
    "puligny-montrachet": {"name": "Puligny-Montrachet", "koreanName": "퓰리니 몽라셰", "region": "Côte de Beaune"},
    "chassagne-montrachet": {"name": "Chassagne-Montrachet", "koreanName": "샤샤뉴 몽라셰", "region": "Côte de Beaune"},
    "santenay": {"name": "Santenay", "koreanName": "상트네", "region": "Côte de Beaune"},
    "saint-aubin": {"name": "Saint-Aubin", "koreanName": "생 토뱅", "region": "Côte de Beaune"},
    "auxey-duresses": {"name": "Auxey-Duresses", "koreanName": "오쎄 뒤레스", "region": "Côte de Beaune"},
    "monthelie": {"name": "Monthélie", "koreanName": "몽텔리", "region": "Côte de Beaune"},
    "maranges": {"name": "Maranges", "koreanName": "마랑주", "region": "Côte de Beaune"},
    "ladoix": {"name": "Ladoix", "koreanName": "라두아", "region": "Côte de Beaune"},
    "chorey-les-beaune": {"name": "Chorey-lès-Beaune", "koreanName": "쇼레 레 본", "region": "Côte de Beaune"},

    # Chalonnaise
    "bouzeron": {"name": "Bouzeron", "koreanName": "부즈롱", "region": "Côte Chalonnaise"},
    "rully": {"name": "Rully", "koreanName": "륄리", "region": "Côte Chalonnaise"},
    "mercurey": {"name": "Mercurey", "koreanName": "메르큐레", "region": "Côte Chalonnaise"},
    "givry": {"name": "Givry", "koreanName": "지브리", "region": "Côte Chalonnaise"},
    "montagny": {"name": "Montagny", "koreanName": "몽타니", "region": "Côte Chalonnaise"},

    # Mâconnais
    "pouilly-fuisse": {"name": "Pouilly-Fuissé", "koreanName": "푸이 퓌세", "region": "Mâconnais"},
    "saint-veran": {"name": "Saint-Véran", "koreanName": "생 베랑", "region": "Mâconnais"},
    "vire-clesse": {"name": "Viré-Clessé", "koreanName": "비레 클레세", "region": "Mâconnais"},
}

# Ensure directories exist
os.makedirs("src/data/villages", exist_ok=True)
os.makedirs("src/assets/maps", exist_ok=True)

for key, info in villages.items():
    # JSON Content
    data = {
        "id": key,
        "name": info["name"],
        "koreanName": info["koreanName"],
        "region": info["region"],
        "description": f"{info['name']} ({info['koreanName']}) - A famous wine village in {info['region']}.",
        "mapFile": f"{key}.svg",
        "parcels": []
    }

    # Write JSON
    with open(f"src/data/villages/{key}.json", "w") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    # SVG Content (Placeholder)
    svg_content = f'''<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#f0f0f0" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">
        {info['name']} Map Placeholder
    </text>
    <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="#666">
        {info['region']}
    </text>
</svg>'''

    # Write SVG
    with open(f"src/assets/maps/{key}.svg", "w") as f:
        f.write(svg_content)

print("Generated village data and map placeholders.")
