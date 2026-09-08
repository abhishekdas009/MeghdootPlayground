const fs = require('fs');
async function test() {
  const formData = new FormData();
  formData.append('password', 'admin123');
  formData.append('title', 'test title');
  const blob = new Blob(['fake content'], { type: 'text/plain' });
  formData.append('file', Object.assign(blob, { name: 'test.txt' }));
  const res = await fetch('http://localhost:3000/api/user-manuals', {
    method: 'POST',
    body: formData
  });
  const text = await res.text();
  console.log(res.status, text);
}
test();
