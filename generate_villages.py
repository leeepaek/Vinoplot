import json
import os

villages = {
    "marsannay": {"name": "Marsannay", "koreanName": "마르사네", "region": "Côte de Nuits", "center": [47.2720, 4.9910]},
    "fixin": {"name": "Fixin", "koreanName": "픽생", "region": "Côte de Nuits", "center": [47.2450, 4.9700]},
    "morey-saint-denis": {"name": "Morey-Saint-Denis", "koreanName": "모레 생 드니", "region": "Côte de Nuits", "center": [47.2030, 4.9620]},
    "vougeot": {"name": "Vougeot", "koreanName": "부조", "region": "Côte de Nuits", "center": [47.1760, 4.9610]},
    "nuits-saint-georges": {"name": "Nuits-Saint-Georges", "koreanName": "뉘 생 조르주", "region": "Côte de Nuits", "center": [47.1350, 4.9500]},
    "aloxe-corton": {"name": "Aloxe-Corton", "koreanName": "알록스 코르통", "region": "Côte de Beaune", "center": [47.0650, 4.8650]},
    "pernand-vergelesses": {"name": "Pernand-Vergelesses", "koreanName": "페르낭 베르젤레스", "region": "Côte de Beaune", "center": [47.0800, 4.8510]},
    "savigny-les-beaune": {"name": "Savigny-lès-Beaune", "koreanName": "사비니 레 본", "region": "Côte de Beaune", "center": [47.0610, 4.8210]},
    "beaune": {"name": "Beaune", "koreanName": "본", "region": "Côte de Beaune", "center": [47.0260, 4.8400]},
    "pommard": {"name": "Pommard", "koreanName": "포마르", "region": "Côte de Beaune", "center": [47.0100, 4.8000]},
    "volnay": {"name": "Volnay", "koreanName": "볼네", "region": "Côte de Beaune", "center": [47.0010, 4.7800]},
    "meursault": {"name": "Meursault", "koreanName": "뫼르소", "region": "Côte de Beaune", "center": [46.9770, 4.7700]},
    "chassagne-montrachet": {"name": "Chassagne-Montrachet", "koreanName": "샤사뉴 몽라셰", "region": "Côte de Beaune", "center": [46.9370, 4.7600]},
    "santenay": {"name": "Santenay", "koreanName": "상트네", "region": "Côte de Beaune", "center": [46.9150, 4.7000]},
    "saint-aubin": {"name": "Saint-Aubin", "koreanName": "생 토뱅", "region": "Côte de Beaune", "center": [46.9500, 4.7100]},
    "auxey-duresses": {"name": "Auxey-Duresses", "koreanName": "오세 뒤레스", "region": "Côte de Beaune", "center": [46.9850, 4.7470]},
    "monthelie": {"name": "Monthelie", "koreanName": "몽텔리", "region": "Côte de Beaune", "center": [46.9930, 4.7670]},
    "maranges": {"name": "Maranges", "koreanName": "마랑주", "region": "Côte de Beaune", "center": [46.9200, 4.6500]},
    "ladoix": {"name": "Ladoix-Serrigny", "koreanName": "라두아", "region": "Côte de Beaune", "center": [47.0670, 4.8850]},
    "chorey-les-beaune": {"name": "Chorey-lès-Beaune", "koreanName": "쇼레 레 본", "region": "Côte de Beaune", "center": [47.0490, 4.8620]},
    "bouzeron": {"name": "Bouzeron", "koreanName": "부즈롱", "region": "Côte Chalonnaise", "center": [46.9060, 4.7210]},
    "rully": {"name": "Rully", "koreanName": "륄리", "region": "Côte Chalonnaise", "center": [46.8740, 4.7430]},
    "mercurey": {"name": "Mercurey", "koreanName": "메르퀴레", "region": "Côte Chalonnaise", "center": [46.8370, 4.7230]},
    "givry": {"name": "Givry", "koreanName": "지브리", "region": "Côte Chalonnaise", "center": [46.7830, 4.7450]},
    "montagny": {"name": "Montagny", "koreanName": "몽타니", "region": "Côte Chalonnaise", "center": [46.7150, 4.6730]},
    "pouilly-fuisse": {"name": "Pouilly-Fuissé", "koreanName": "푸이 퓌세", "region": "Mâconnais", "center": [46.2800, 4.7300]},
    "saint-veran": {"name": "Saint-Véran", "koreanName": "생 베랑", "region": "Mâconnais", "center": [46.2500, 4.7400]},
    "vire-clesse": {"name": "Viré-Clessé", "koreanName": "비레 클레세", "region": "Mâconnais", "center": [46.4300, 4.8600]},
    "chablis": {"name": "Chablis", "koreanName": "샤블리", "region": "Chablis", "center": [47.8100, 3.8000]},
}

os.makedirs("src/data/villages", exist_ok=True)

for vid, info in villages.items():
    filepath = f"src/data/villages/{vid}.json"
    if not os.path.exists(filepath):
        data = {
            "id": vid,
            "name": info["name"],
            "koreanName": info["koreanName"],
            "region": info["region"],
            "center": info["center"],
            "zoom": 14,
            "parcels": []
        }
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Created {filepath}")
    else:
        print(f"Skipped {filepath} (already exists)")

print("Done.")
