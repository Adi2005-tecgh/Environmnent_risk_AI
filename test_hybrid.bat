@echo off
cd /d "c:\Users\LENOVO\Desktop\environment\.venv\Scripts"
call activate.bat
cd ..
echo Testing hybrid classification...
python -c "
import sys
sys.path.insert(0, '.')
try:
    from app.model_loader import model_loader
    print('Testing hybrid classification...')
    
    # Test text classification
    text_result = model_loader._classify_from_text('factory fire smoke')
    print(f'Text result: {text_result}')
    
    # Test hybrid classification
    hybrid_result = model_loader.classify_hybrid_violation('test_image.jpg', 'factory fire smoke')
    print(f'Hybrid result: {hybrid_result}')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
"
pause
