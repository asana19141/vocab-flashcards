const sheetID = '1MfRoxFmyE08Rw8poBaRZ2xClL1zQHae9dAWgaKBQCdI';
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

let vocabList = [];
let filteredList = [];
let currentIndex = 0;
let showingMeaning = false;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table.rows;

    // ✅ 跳過第一列（標題列）
    const dataRows = rows.slice(1);

    vocabList = dataRows.map(row => ({
      category: row.c[0]?.v || '未分類',
      word: row.c[1]?.v || '',
      meaning: row.c[2]?.v || '',
      example: row.c[3]?.v || ''
    }));

    populateCategories();
    filterByCategory('全部');
  });

function populateCategories() {
  const select = document.getElementById('category-select');
  const categories = ['全部', ...new Set(vocabList.map(item => item.category))];
  select.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  select.addEventListener('change', () => {
    filterByCategory(select.value);
  });
}

function filterByCategory(category) {
  const list = category === '全部'
    ? vocabList
    : vocabList.filter(item => item.category === category);
  filteredList = shuffleArray(list);
  currentIndex = 0;
  showingMeaning = false;
  showCard();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showCard() {
  const card = document.getElementById('card');
  if (filteredList.length === 0) {
    card.innerHTML = '此分類沒有單字';
    return;
  }
  const item = filteredList[currentIndex];
  if (showingMeaning) {
    card.innerHTML = `
      <div class="meaning">${item.meaning}</div>
      <div class="example"><small></small><br>${item.example}</div>
    `;
  } else {
    card.textContent = item.word;
  }
}

document.getElementById('card').addEventListener('click', () => {
  showingMeaning = !showingMeaning;
  showCard();
});

document.getElementById('next-btn').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % filteredList.length;
  showingMeaning = false;
  showCard();
});
