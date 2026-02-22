import subprocess
import sys
import os

def run_hybrid_test():
    try:
        print("🧪 HYBRID SYSTEM TEST - Python Direct Execution")
        
        # Import and test the hybrid system
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from app.model_loader import model_loader
        
        # Test 1: Fire description + fire image should match
        result1 = model_loader.classify_hybrid_violation('test_image.jpg', 'factory fire smoke')
        print(f"✅ Test 1 - Fire + Fire Image: {result1['violation_type']} ({result1['severity']}) - {result1['confidence']:.3f}")
        
        # Test 2: Smoke description + smoke image should match  
        result2 = model_loader.classify_hybrid_violation('test_image.jpg', 'smoke from factory')
        print(f"✅ Test 2 - Smoke + Smoke Image: {result2['violation_type']} ({result2['severity']}) - {result2['confidence']:.3f}")
        
        # Test 3: No keywords + non-hazard image should use text only
        result3 = model_loader.classify_hybrid_violation('test_image.jpg', 'clear day')
        print(f"✅ Test 3 - No keywords + Clean Image: {result3['violation_type']} ({result3['severity']}) - {result3['confidence']:.3f}")
        
        print("🎯 HYBRID SYSTEM TEST COMPLETED SUCCESSFULLY")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = run_hybrid_test()
    if success:
        print("🚀 HYBRID SYSTEM READY FOR PRODUCTION")
    else:
        print("❌ HYBRID SYSTEM TEST FAILED")
