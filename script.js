const url = 'https://script.google.com/macros/s/AKfycbzD3mqhir_GqsWsmY-Ibmh-UUNEEyxRM115izMLU4egu9uv21PKexTuz6vcUw53ay8mYg/exec';

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rawDate = document.getElementById('date').value;
  const dateObj = new Date(rawDate);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const data = {
    date: formattedDate,
    amount: parseFloat(document.getElementById('amount').value),
    type: document.getElementById('type').value,
    note: document.getElementById('note').value
  };

  await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    }
  });

  alert('Đã ghi nhận!');
  document.getElementById('form').reset();
  loadData();
});

document.getElementById('settle').addEventListener('click', async () => {
  const from = new Date(document.getElementById('fromDate').value);
  const to = new Date(document.getElementById('toDate').value);
  to.setHours(23, 59, 59); // bao trọn ngày đến

  const res = await fetch(url);
  const data = await res.json();

  const rows = data.rows.filter(row => {
    if (!row.date) return false;

    let d;
    if (typeof row.date === 'string' && row.date.includes('/')) {
      const parts = row.date.split('/');
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      d = new Date(row.date);
    }

    return d >= from && d <= to;
  });

  let thu = 0, chi = 0;
  rows.forEach(row => {
    thu += parseFloat(row.thu || 0);
    chi += parseFloat(row.chi || 0);
  });
  const conLai = thu - chi;

  const chuKy = `${document.getElementById('fromDate').value.split('-').reverse().join('/')} - ${document.getElementById('toDate').value.split('-').reverse().join('/')}`;

  // Nếu muốn gửi settle lên server thì mở đoạn dưới:
  /*
  await fetch(url + '?action=settle', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ chuKy, thu, chi, conLai })
  });
  */

  document.getElementById('result').innerHTML = `
    <p>Tổng thu: ${thu}</p>
    <p>Tổng chi: ${chi}</p>
    <p><strong>Còn lại: ${conLai}</strong></p>
  `;

  loadData();
});

async function loadData() {
  const res = await fetch(url);
  const data = await res.json();
  const tbody = document.querySelector('#history tbody');
  tbody.innerHTML = '';

  // ✅ Sắp xếp theo ngày mới nhất trước
  data.rows?.sort((a, b) => {
    const parse = (s) => {
      if (!s) return 0;
      if (s.includes('/')) {
        const [d, m, y] = s.split('/');
        return new Date(`${y}-${m}-${d}`);
      }
      return new Date(s);
    };
    return parse(b.date) - parse(a.date); // giảm dần
  }).forEach(row => {
    let formattedDate = row.date;
    if (row.date?.includes('T')) {
      const d = new Date(row.date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDate = `${day}/${month}/${year}`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formattedDate}</td><td>${row.thu || ''}</td><td>${row.chi || ''}</td><td>${row.note || ''}</td>`;
    tbody.appendChild(tr);
  });
}

loadData();
