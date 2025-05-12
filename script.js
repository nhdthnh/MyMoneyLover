const url = 'https://script.google.com/macros/s/AKfycbzD3mqhir_GqsWsmY-Ibmh-UUNEEyxRM115izMLU4egu9uv21PKexTuz6vcUw53ay8mYg/exec'; // thay bằng của bạn

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    date: document.getElementById('date').value,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    note: document.getElementById('note').value
  };

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });

  alert('Đã ghi nhận!');
  document.getElementById('form').reset();
  loadData(); // load lại bảng
});

document.getElementById('settle').addEventListener('click', async () => {
  const res = await fetch(url);
  const data = await res.json();
  document.getElementById('result').innerHTML = `
    <p>Tổng thu: ${data.thu}</p>
    <p>Tổng chi: ${data.chi}</p>
    <p><strong>Còn lại: ${data.conLai}</strong></p>
  `;
});

async function loadData() {
  const res = await fetch(url);
  const data = await res.json();
  const tbody = document.querySelector('#history tbody');
  tbody.innerHTML = '';
  data.rows?.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.date}</td><td>${row.thu}</td><td>${row.chi}</td><td>${row.note}</td>`;
    tbody.appendChild(tr);
  });
}
loadData(); // gọi ngay khi mở web
