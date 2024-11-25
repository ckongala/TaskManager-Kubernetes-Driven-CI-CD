import pytest
from app import app, db, Task

# This will run before each test
@pytest.fixture(scope="module")
def test_client():
    # Set up the Flask test client
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///test.db"  # Use SQLite for testing
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Ensure the app context is pushed before interacting with the DB
    with app.app_context():
        db.create_all()  # This creates the tables

    with app.test_client() as client:
        yield client

    # Cleanup after tests
    with app.app_context():
        db.session.remove()
        db.drop_all()

# Test the basic route
def test_index(test_client):
    response = test_client.get('/')
    # Print the response to see what is returned
    print("Index response:", response.data)
    assert response.status_code == 200

# Test creating a task
def test_create_task(test_client):
    task_data = {'title': 'Test Task', 'description': 'This is a test task.'}
    response = test_client.post('/tasks', json=task_data)
    
    # Print the full response for debugging
    print("Create task response:", response.data)
    
    assert response.status_code == 201

# Test getting all tasks
def test_get_tasks(test_client):
    response = test_client.get('/tasks')
    
    # Print the full response for debugging
    print("Get tasks response:", response.data)
    
    assert response.status_code == 200

# Test updating a task
def test_update_task(test_client):
    # First, create a task
    task_data = {'title': 'Task to Update', 'description': 'Old description'}
    response = test_client.post('/tasks', json=task_data)
    response_json = response.get_json()
    
    # Get the task ID for updating
    task_id = response_json.get('task', {}).get('id', None)

    if task_id is None:
        print("Error: 'id' is missing from the created task.")
        return
    
    updated_data = {'title': 'Updated Task', 'description': 'Updated description'}
    response = test_client.put(f'/tasks/{task_id}', json=updated_data)
    
    # Print the full response for debugging
    print("Update task response:", response.data)
    
    assert response.status_code == 200

# Test deleting a task
def test_delete_task(test_client):
    # First, create a task
    task_data = {'title': 'Task to Delete', 'description': 'This will be deleted'}
    response = test_client.post('/tasks', json=task_data)
    response_json = response.get_json()
    
    # Get the task ID for deletion
    task_id = response_json.get('task', {}).get('id', None)

    if task_id is None:
        print("Error: 'id' is missing from the created task.")
        return

    response = test_client.delete(f'/tasks/{task_id}')
    
    # Print the full response for debugging
    print("Delete task response:", response.data)
    
    assert response.status_code == 200
