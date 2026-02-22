import sys
import os

print("Testing hybrid system...")
from app.model_loader import model_loader
result = model_loader.classify_hybrid_violation('test_image.jpg', 'factory fire smoke')
print(f'Test result: {result}')
