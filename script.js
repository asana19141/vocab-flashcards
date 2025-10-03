const sheetID = '1MfRoxFmyE08Rw8poBaRZ2xClL1zQHae9dAWgaKBQCdI';
const gidMap = {
  '日文': '0',
  '中文': '430444781',
  '英文': '1056355295'
};

let vocabList = [];
let filteredList = [];
let currentIndex = 0;
let showingMeaning = false;
let selectedLanguage = '日文'; // 預設語言

loadSheet(selectedLanguage);

document.getElementById('target-language').addEventListener('change', (e) => {
  selectedLanguage = e.target.value;
  loadSheet(selectedLanguage);
});

function loadSheet(language) {
  const gid = gidMap[language];
  const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&gid=${gid}`;

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows.slice(1);
      vocabList = rows.map(row => ({
        category: row.c[0]?.v?.trim() || '未分類',
        word: row.c[1]?.v?.trim() || '',
        pronunciation: row.c[2]?.v?.trim() || '',
        meaning: row.c[3]?.v?.trim() || '',
        example: row.c[4]?.v?.trim() || ''
      }));
      populateCategories();
      filterByCategory('全部');
    })
    .catch(err => {
      console.error('資料載入失敗', err);
      document.getElementById('card').innerHTML = '無法載入資料，請稍後再試';
    });
}

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
  select.onchange = () => {
    filterByCategory(select.value);
  };
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

function showCard() {
  const card = document.getElementById('card');
  if (filteredList.length === 0) {
    card.innerHTML = '此分類沒有符合語言的單字';
    return;
  }
  const item = filteredList[currentIndex];
  if (showingMeaning) {
    card.innerHTML = `
      <div class="pronunciation"><small></small><br>${item.pronunciation}</div>
      <div class="meaning">${item.meaning}</div>
      <div class="example"><small></small><br>${item.example}</div>
    `;
  } else {
    card.textContent = item.word;
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
