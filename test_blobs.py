import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

import urllib.parse
from backend.services.firebase_service import init_firebase, get_bucket

def test_list_blobs():
    init_firebase()
    from firebase_admin import storage
    bucket = storage.bucket("nagarmitra-8cc51.firebasestorage.app")
    blobs = bucket.list_blobs(prefix="dummy issue/")
    print(f"Bucket name: {bucket.name}")
    for blob in blobs:
        print(f"Blob name: {blob.name}")
        encoded_name = urllib.parse.quote(blob.name, safe='')
        url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{encoded_name}?alt=media"
        print(f"Constructed URL: {url}")

if __name__ == "__main__":
    test_list_blobs()
