from app import create_app
import os

app = create_app()




if __name__ == '__main__':
    # Ensure port is an integer
    port = int(os.environ.get('PORT', 5000))
    
    # Run server
    # 0.0.0.0 makes the server accessible from other devices in the same network
    app.run(host='0.0.0.0', port=port, debug=True)
