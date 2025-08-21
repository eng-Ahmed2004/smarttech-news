// ===== Dataset (expanded & realistic) =====
const phones = [
  {name:"Samsung S25 Ultra", brand:"Samsung", price:1299, battery:5000, rating:95, img:"https://th.bing.com/th/id/OIP.preWGIcvHevm2B-sl2wzdgHaE8?w=176&h=182&c=7&r=0&o=5&dpr=1.3&pid=1.7"},
  {name:"iPhone 16 Pro Max", brand:"Apple", price:1399, battery:4700, rating:92, img:"https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg"},
  {name:"Xiaomi 15 Pro", brand:"Xiaomi", price:899, battery:5100, rating:88, img:"https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14-pro.jpg"},
  {name:"Google Pixel 9 Pro", brand:"Google", price:1099, battery:4800, rating:90, img:"https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg"},
  {name:"OnePlus 13 Pro", brand:"OnePlus", price:949, battery:5000, rating:87, img:"https://fdn2.gsmarena.com/vv/bigpic/oneplus-12.jpg"},
  {name:"Oppo Find X7", brand:"Oppo", price:999, battery:4900, rating:85, img:"https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x6-pro.jpg"},
  {name:"Huawei Mate 70 Pro", brand:"Huawei", price:1050, battery:5200, rating:86, img:"https://th.bing.com/th/id/OIP.BW63VxE5nOJkBRSl6ddsXAHaJ1?w=136&h=182&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"},
  {name:"Sony Xperia 1 VI", brand:"Sony", price:1200, battery:5000, rating:84, img:"https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-v.jpg"}
];

// ===== DOM =====
const phoneList = document.getElementById("phoneList");
const brandFilter = document.getElementById("brandFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");
const compareSection = document.getElementById("compareSection");
const compareTable = document.getElementById("compareTable");
const resetCompare = document.getElementById("resetCompare");
const rankingList = document.getElementById("rankingList");
const toast = document.getElementById("toast");

let selectedPhones = [];

// ===== Reveal on Scroll (IntersectionObserver) =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Populate Brands =====
const brands = [...new Set(phones.map(p => p.brand))];
brands.forEach(b => {
  const opt = document.createElement("option");
  opt.value = b; opt.textContent = b;
  brandFilter.appendChild(opt);
});

// ===== Render Phones =====
function renderPhones(list){
  phoneList.innerHTML = "";
  list.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "phone-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <span class="badge price-badge">$${p.price}</span>
      <p>Brand: ${p.brand}</p>
      <div>
        <small>Battery</small>
        <div class="battery-bar"><div class="battery-fill" style="width:${Math.min(100, (p.battery/60))}%"></div></div>
        <small>${p.battery} mAh</small>
      </div>
      <div>
        <small>Rating</small>
        <div class="rating-bar"><div class="rating-fill" style="width:${p.rating}%"></div></div>
        <small>${p.rating}%</small>
      </div>
      <button type="button" onclick="addToCompare(${i})">➕ Compare</button>
    `;
    phoneList.appendChild(card);
  });

  // Staggered reveal for cards on each render
  document.querySelectorAll('.phone-card').forEach((card, idx) => {
    card.classList.add('reveal');
    card.style.setProperty('--d', `${Math.min(idx * 0.05, 0.4)}s`);
    io.observe(card);
  });
}

// ===== Compare (two only) =====
function addToCompare(i){
  const item = phones[i];
  if (selectedPhones.find(p => p.name === item.name)) {
    showToast(`${item.name} is already selected.`, 'error');
    return;
  }
  if (selectedPhones.length >= 2){
    showToast("Only 2 phones allowed for comparison!", "error");
    return;
  }
  selectedPhones.push(item);
  showToast(`${item.name} added to compare`, "success");
  if (selectedPhones.length === 2) showCompare();
}

function showCompare(){
  compareSection.style.display = "block";
  compareTable.innerHTML = "";

  selectedPhones.forEach((p) => {
    const box = document.createElement("div");
    box.className = "compare-box";
    box.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>💲 Price: <span data-key="price">${p.price}</span></p>
      <p>⚡ Battery: <span data-key="battery">${p.battery} mAh</span></p>
      <p>⭐ Rating: <span data-key="rating">${p.rating}%</span></p>
    `;
    compareTable.appendChild(box);
  });

  // Slide-in reveal for the two boxes
  [...document.querySelectorAll('#compareTable .compare-box')].forEach((box, i) => {
    setTimeout(() => box.classList.add('show'), 120 * i);
  });

  // Highlight better specs
  highlightBetter();
}

function highlightBetter(){
  const [a, b] = selectedPhones;
  const specs = ["price", "battery", "rating"]; // price lower is better; others higher better

  // Get spans in order in each box
  const boxA = compareTable.children[0];
  const boxB = compareTable.children[1];

  specs.forEach((key) => {
    const spanA = boxA.querySelector(`span[data-key="${key}"]`);
    const spanB = boxB.querySelector(`span[data-key="${key}"]`);

    // Parse numeric values
    const valA = key === "price" ? Number(spanA.textContent) :
                 key === "battery" ? Number(spanA.textContent.replace(/\D/g,'')) :
                 Number(spanA.textContent.replace('%',''));
    const valB = key === "price" ? Number(spanB.textContent) :
                 key === "battery" ? Number(spanB.textContent.replace(/\D/g,'')) :
                 Number(spanB.textContent.replace('%',''));

    if (key === "price") {
      // Lower is better
      (valA < valB ? spanA : spanB).classList.add("better");
    } else {
      // Higher is better
      (valA > valB ? spanA : spanB).classList.add("better");
    }
  });
}

resetCompare.addEventListener("click", ()=>{
  selectedPhones = [];
  compareSection.style.display = "none";
});

// ===== Ranking =====
function renderRanking(){
  const top = [...phones].sort((a,b)=> b.rating - a.rating).slice(0,3);
  rankingList.innerHTML = "";
  top.forEach((p,i)=>{
    const card = document.createElement("div");
    card.className = "rank-card";
    card.innerHTML = `
      <h3>${["🥇","🥈","🥉"][i]}</h3>
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>⭐ ${p.rating}%</p>
    `;
    rankingList.appendChild(card);
  });
}

// ===== Toast (animated) =====
function showToast(msg, type='success'){
  const t = toast;
  t.textContent = msg;
  t.className = ''; // reset
  t.classList.add(type, 'showing');
  void t.offsetWidth; // reflow
  t.classList.add('live');
  setTimeout(()=>{
    t.classList.remove('live');
    t.classList.add('hiding');
    setTimeout(()=>{ t.className=''; t.style.display='none'; }, 220);
  }, 2000);
  t.style.display = 'block';
}

// ===== Filters =====
function applyFilters(){
  let list = [...phones];
  const brand = brandFilter.value;
  const price = priceFilter.value;
  const search = searchInput.value.toLowerCase();
  const sort = sortFilter.value;

  if (brand !== "all") list = list.filter(p => p.brand === brand);
  if (price === "low") list = list.filter(p => p.price < 800);
  if (price === "mid") list = list.filter(p => p.price >= 800 && p.price <= 1200);
  if (price === "high") list = list.filter(p => p.price > 1200);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search));

  switch(sort){
    case "priceLow": list.sort((a,b)=> a.price - b.price); break;
    case "priceHigh": list.sort((a,b)=> b.price - a.price); break;
    case "battery": list.sort((a,b)=> b.battery - a.battery); break;
    case "rating": list.sort((a,b)=> b.rating - a.rating); break;
  }
  renderPhones(list);
}

brandFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

// ===== Dark Mode =====
document.getElementById("toggleMode").addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
});

// ===== Init =====
renderPhones(phones);
renderRanking();
