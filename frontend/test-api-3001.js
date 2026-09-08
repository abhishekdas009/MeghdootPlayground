async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/user-manuals');
    const text = await res.text();
    console.log(res.status, text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();
