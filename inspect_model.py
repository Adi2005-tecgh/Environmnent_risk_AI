import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.model_loader import model_loader
    model = model_loader.get_fire_smoke_model()
    print("MODEL CLASS NAMES:", model.names)
    print("\nCLASS ORDER (index: name):")
    for idx, name in model.names.items():
        print(f"  Index {idx} -> '{name}'")
except Exception as e:
    print("ERROR:", e)
    import traceback; traceback.print_exc()
