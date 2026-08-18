const STORAGE_KEY = "world-travel-500-progress-v1";
const MEDIA_CACHE_KEY = "world-travel-650-media-v25";
const $ = (id) => document.getElementById(id);
let places = [];
let visited = new Set();
let mediaObserver = null;
let mediaCache = {};
const PAGE_SIZE = 100;
let currentPage = 1;
try { mediaCache = JSON.parse(localStorage.getItem(MEDIA_CACHE_KEY) || "{}"); } catch (_) { mediaCache = {}; }

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"})[c]);
}

const featuredMedia = {
  603:{city:"Banyuwangi",file:"Blue fire of Ijen, Kawah Ijen, Java, Indonesia, 20220821 0432 9581.jpg"},
  614:{city:"Antigua",file:"Fuego eruption by night - 54974845875.jpg"},
  528:{city:"Ubud",file:"Bali 040 - Ubud - kecak fire dance.jpg"},
  520:{city:"Paro",file:"Jakar tshechu, dancers (15222929514).jpg"},
  589:{city:"Reykjavík",file:"Iceland thrihnukagigur-volcano inside of crater.jpg"},
  630:{city:"Okayama",file:"Hadaka Matsuri (-Naked Festival-) in Saidaiji, Japan.jpg"},
  607:{city:"Ölgii",file:"Kazakh Eagle Hunters.JPG"},
  294:{city:"Angangueo",file:"Mariposa Monarca, El Rosario, Michoacán.jpg"},
  189:{city:"Tarragona",file:"5d8 CVXV (Colla Vella dels Xiquets de Valls, human tower, Catalonia).jpg"},
  582:{city:"Lonorore",file:"Landdiving2.jpg"},
  574:{city:"Kemi",file:"2017-03-23 Sampo in Port of Kemi (Finland) 02.jpg"},
  610:{city:"La Paz",file:"Death Road2.jpg"},
  611:{city:"León",file:"Volcano Boarding Cerro Negro.jpg"},
  600:{city:"Neiafu",file:"Humpback Whales - Flickr - Christopher.Michel.jpg"},
  584:{city:"Port St Johns",file:"Underwater view of the sardine run as a dolphin hunts within dense schools of sardines.jpg"},
  116:{city:"Hanga Roa",image:"./assets/rank-116-easter-island.jpg?v=20260818"},
  565:{city:"Beijing",file:"Jiankou Great Wall.jpg"},
  591:{city:"Springdale",file:"Zion Angels landing Panorama.jpg"},
  147:{city:"Lenakel",file:"Mount Yasur eruption 2006, Tanna Island, Vanuatu, VAN 0516.jpg"},
  567:{city:"Probolinggo",file:"Indonesia - Bromo (37395212635).jpg"},
  374:{city:"Jeju City",file:"Jeju - Seongsan Ilchulbong.jpg"},
  151:{city:"Ponta Delgada",file:"Sao Miguel Island (Azores). Sete Cidades Caldera, Lagoa de Santiago, Azores.jpg"},
  563:{city:"Tenerife",file:"Lightning and the Milky way.jpg"},
  594:{city:"Chamonix",file:"A view of Mont Blanc from the Tour du Mont Blanc, 2007.jpg"},
  551:{city:"Black Rock City",file:"BM 2010 Centre Camp.jpg"},
  540:{city:"Dublin",file:"ST. PATRICK'S DAY PARADE 2007 - DUBLIN (425244888).jpg"},
  385:{city:"Bekopaka",file:"Relief karstique, Parc Tsingy de Bemaraha, Madagascar.jpg"},
  302:{city:"Morondava",file:"Sunset on the Avenue of the Baobabs.jpg"},
  132:{city:"Nara",file:"Daibutsu of Todaiji 2.jpg"},
  648:{city:"Geiranger",file:"Geirangerfjord boats.jpg"},
  572:{city:"Pokhara",file:"Sunrise Over Pokhara Peace Pagoda And Annapurna Range.jpg"},
  571:{city:"Manang",file:"Thorong La pass overview - Annapurna Circuit, Nepal - panoramio.jpg"},
  505:{city:"Port of Spain",file:"Trinidad Carnival-5492.jpg"},
  471:{city:"Panama City",file:"Exclusa Miraflores Canal de Panama Panorama.jpg"},
  327:{city:"Ghanzi",file:"Kudu of kalahari.jpg"},
  475:{city:"Las Vegas",file:"Las Vegas Strip at night, 2012.jpg"},
  466:{city:"West Glacier",file:"Stanton Mountain reflected in Lake McDonald.jpg"},
  1:{city:"Siem Reap",file:"Angkor Vat (6931599619).jpg"},
  2:{city:"Cairns",file:"Amazing Great Barrier Reef 1.jpg"},
  3:{city:"Cusco",file:"Peru Machu Picchu Sunrise.jpg"},
  4:{city:"Beijing",file:"Great wall panorama.jpg"},
  5:{city:"Agra",file:"Taj Mahal Front.JPG"},
  6:{city:"Flagstaff",file:"Grand Canyon view from Pima Point 2010.jpg"},
  7:{city:"Rome",file:"Colosseum Rome.jpg"},
  8:{city:"Puerto Iguazú",file:"Iguazu Falls Panorama 2009.jpg"},
  9:{city:"Granada",file:"Alhambra - Granada.jpg"},
  10:{city:"Istanbul",file:"Hagia Sophia Mars 2013.jpg"},
  18:{city:"Santorini",file:"1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg"},
  19:{city:"Puerto Ayora",file:"Santa Cruz giant tortoise 03.jpg"},
  27:{city:"Victoria Falls",file:"Cataratas Victoria, Zambia-Zimbabue, 2018-07-27, DD 16-20 PAN.jpg"},
  39:{city:"Khuzhir",file:"Lake Baikal in winter.jpg"},
  42:{city:"Havana",file:"National-Capitol-and-classic-cars-in-Havana-Cuba-225-031-061A.jpg"},
  77:{city:"Crescent City",file:"Redwood National Park, fog in the forest.jpg"},
  114:{city:"Ayutthaya",file:"Royal Palace of Ayutthaya.jpg"},
  115:{city:"Vatican City",file:"CAPPELLA SISTINA Ceiling.jpg"},
  148:{city:"Leshan",file:"Leshan Buddha Statue View.JPG"},
  155:{city:"Orlando",file:"Magic Kingdom, Disney World.jpg"},
  173:{city:"Elmina",file:"Elmina Castle - Elmina, Ghana.jpg"},
  177:{city:"Estes Park",file:"Cloudy morning at bear lake (37317249226).jpg"},
  190:{city:"Amsterdam",file:"Van Gogh - Starry Night - Google Art Project.jpg"},
  208:{city:"New York City",file:"Times Square Panorama At Night (200279283).jpeg"},
  209:{city:"El Nido",file:"Island lagoon in Bacuit Bay, El Nido, Palawan, Philippines.jpg"},
  238:{city:"Luxor",file:"Luxor, Luxor Temple, front view at night, Egypt, Oct 2004.jpg"},
  239:{city:"London",file:"Museo de Historia Natural, Londres, Inglaterra, 2022-11-25, DD 50-52 HDR.jpg"},
  275:{city:"Yakushima",file:"Yaku-Island Shiratani-Unsui-Gorge.jpg"},
  278:{city:"Furnace Creek",file:"Zabriskie Point Death Valley National park.jpeg"},
  290:{city:"Hadibu",file:"Dragon's Blood Trees, Socotra Is. (24142290504).jpg"},
  312:{city:"Kuala Lumpur",file:"Petronas Panorama II.jpg"},
  330:{city:"Vieques",file:"Mosquito bay, Bioluminescent bay, Vieques - panoramio (3).jpg"},
  350:{city:"Moorea",file:"DSC00041 French Polynésia Mooréa Island Lagoon Hauru (8076082336).jpg"},
  448:{city:"Taipei",file:"View of Taipei, Taiwan Night Skyline 2019.jpg"},
  476:{city:"Lotofaga",file:"To Sua Ocean Trench, Upolu, Samoa - August 2016.jpg"},
  55:{city:"Paris",file:"NotreDameDeParis.jpg"},
  64:{city:"Portree",file:"Old Man of Storr, Isle of Skye, Scotland - Diliff.jpg"},
  84:{city:"Kayenta",file:"Monument Valley Sunset MC.jpg"},
  97:{city:"Honolulu",file:"USS Arizona Memorial, Pearl Harbor, Hawaii.jpg"},
  117:{city:"Hong Kong",file:"View of Hong Kong from Victoria Peak.jpg"},
  120:{city:"Darchen",file:"KailashKoraTibetans.jpg"},
  125:{city:"Oban",file:"Stewart Island as seen from i plane.jpg"},
  195:{city:"Paju",file:"Joint Security Area (3069693747).jpg"},
  221:{city:"Berlin",file:"Ruins of the Reichstag in Berlin, 3 June 1945. BU8573.jpg"},
  295:{city:"Ein Bokek",file:"Dead Sea floating (Unsplash).jpg"},
  323:{city:"Moab",file:"Delicate Arch, Arches National Park, Utah (20) (6991760995).jpg"},
  324:{city:"Ometepe",file:"Ometepe Island with Concepcion Volcano - From Lake Nicaragua - Nicaragua - 02 (31712521586).jpg"},
  351:{city:"Grundarfjörður",file:"Kirkjufell Panorama - Flickr - Simaron.jpg"},
  364:{city:"Springdale",file:"Upper Zion Canyon Panorama.jpg"},
  368:{city:"Belize City",file:"Glovers Reef atoll belize 20221222 140052.jpg"},
  446:{city:"Debar",file:"Bigorski Monastery, N. Macedonia.jpg"},
  452:{city:"Kyiv",file:"Kyiv Pechersk Lavra - detailed panoramic view.jpg"},
  217:{city:"Hangzhou",file:"West Lake Panorama at Dusk.jpg"},
  397:{city:"Taipei",file:"National Palace Museum Front View.jpg"},
  490:{city:"Oban",file:"Fingals cave Staffa Iona Scotland deepInside.jpg"},
  491:{city:"Pisa",file:"Leaning Tower Pisa - Front view.jpg"},
  492:{city:"Trebujeni",file:"Biserica „Nașterea Domnului” 4.jpg"},
  493:{city:"Monaco",file:"Oceanographic Museum.jpg"},
  494:{city:"Oslo",file:"Oslo Opera house exterior in 2010.jpg"},
  495:{city:"Lüderitz",file:"Kolmanskop Ghost Town.jpg"},
  504:{city:"New Orleans",file:"Mardi Gras Parade, New Orleans, Louisiana (LOC).jpg"},
  508:{city:"Mathura",file:"Life in colour - Thousands celebrate Holi in Mathura.jpg"},
  518:{city:"Kyoto",file:"Yamaboko Gion.jpg"},
  524:{city:"Chiang Mai",file:"Yi peng sky lantern festival San Sai Thailand.jpg"},
  533:{city:"Buñol",file:"LaTomatina2010.jpg"},
  544:{city:"Cologne",file:"Kölner Rosenmontagszug-8944.jpg"},
  556:{city:"Ouidah",file:"Voodoo king and his entourage leaving the Jan 10 festival on foot, Ouidah, Benin.jpg"},
  566:{city:"Tanabe",file:"Kumano Kodo Pilgrimage Trail, Koguchi to Nachisan, Japan (48912307128).jpg"},
  568:{city:"Petra",file:"38 Petra Monastery Trail - The Trail Following the Monastery - panoramio.jpg"},
  570:{city:"Antalya",file:"Perge nymphaeum.jpg"},
  581:{city:"Cusco",file:"Ausangate Landscape.jpg"},
  583:{city:"Puerto Natales",file:"Valle De Frances Cerro Paine Grande.jpg"},
  585:{city:"El Chaltén",file:"Laguna de Los Tres Panorama.jpg"},
  588:{city:"Kula",file:"Dawn on Haleakala Volcano, Hawaii.jpg"},
  593:{city:"Lihue",file:"Na Pali Coast Kauai Hawaii (32406276598).jpg"},
  615:{city:"Kokoda",file:"Kokoda Track WV banner.JPG"},
  622:{city:"Mývatn",file:"Iceland lake Northern Lights (Unsplash).jpg"},
  623:{city:"Inari",file:"Reindeer Ukonjärvi-Inarijärvi, Finland 07.jpg"},
  627:{city:"Göreme",file:"Hot air balloon ride at sunrise in Cappadocia 3.JPG"},
  645:{city:"Seligman",file:"Route 66 emblem on Route 66.jpg"},
  646:{city:"Big Sur",file:"Bixby Creek Bridge, California, USA - May 2013.jpg"},
  649:{city:"Uyuni",file:"Luminous Salar de Uyuni (ann22042q).jpg"},
  650:{city:"King Salmon",file:"Grizzly Bear Fishing Brooks Falls.jpg"},
  644:{city:"Mendoza",file:"Vineyard in Mendoza, Argentina.jpg"},
  597:{city:"Calenzana",file:"Refuge d'E Capannelle en 2021.jpg"},
  601:{city:"Porto Covo",file:"Fisherman's Trail, Portugal in November (51803249902).jpg"},
  602:{city:"Theth",file:"The Accursed Mountains 05.jpg"},
  210:{city:"Cape Town",file:"Robben Island Maximum Security Prison administration building.jpg"},
  240:{city:"Delhi",file:"View of Chandni Chowk, Old Delhi, India - September 2014.jpg"},
  248:{city:"Baa Atoll",file:"Anantara Kihavah - Aerial Hero Shot 2024.jpg"},
  255:{city:"Rhodes",file:"Rhodes Old Town Street of Knights 8.JPG"},
  284:{city:"Taveuni",file:"Fiji; Reef Near Six Senses - 52487847681.jpg"},
  421:{city:"Buenos Aires",file:"Art Nouveau Type Tombs Recoleta Cemetery Buenos Aires Argentina.jpg"},
  460:{city:"Sainte-Rose",file:"Fournaise (119943209).jpeg"},
  560:{city:"Albuquerque",file:"Mass Ascension 2012.jpg"},
  569:{city:"Fethiye",file:"The Lycian Way - 2014.10 - panoramio.jpg"},
  643:{city:"El Calafate",file:"A patagonian herder focused on the task.jpg"},
  331:{city:"Zhangjiajie",file:"1 tianzishan wulingyuan zhangjiajie 2012.jpg"},
  514:{city:"Huangshan",file:"Huangshan pic 4.jpg"},
  515:{city:"Guilin",file:"Guilin Li River.jpg"},
  516:{city:"Fengjie",file:"Qutang Gorge on Changjiang.jpg"},
};

function englishPart(value) {
  const text = String(value || "").trim();
  const parenthetical = text.match(/\(([^()]*)\)\s*$/);
  if (parenthetical) return parenthetical[1].trim();
  if (text.includes("/")) return text.split("/").pop().trim();
  return text.replace(/[\u4e00-\u9fff]/g, "").trim();
}

function seededMedia(p) {
  const featured = featuredMedia[p.rank];
  if (featured) return {
    city: featured.city,
    image: featured.image || `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(featured.file)}?width=720`
  };
  return mediaCache[p.rank] || null;
}

function saveMediaCache() {
  try { localStorage.setItem(MEDIA_CACHE_KEY, JSON.stringify(mediaCache)); } catch (_) {}
}

async function fetchCommonsImage(query) {
  try {
    const params = new URLSearchParams({
      action:"query", format:"json", origin:"*", generator:"search",
      gsrsearch:query, gsrnamespace:"6", gsrlimit:"1",
      prop:"imageinfo", iiprop:"url", iiurlwidth:"720"
    });
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
    if (!response.ok) return "";
    const json = await response.json();
    const page = Object.values(json.query?.pages || {})[0];
    return page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url || "";
  } catch (_) {
    return "";
  }
}

async function fetchMedia(p) {
  const seeded = seededMedia(p);
  if (seeded?.image) return seeded;
  const query = `${englishPart(p.name)} ${englishPart(p.country)}`;
  const params = new URLSearchParams({
    action:"query", format:"json", origin:"*", generator:"search",
    gsrsearch:query, gsrnamespace:"0", gsrlimit:"1",
    prop:"pageimages|coordinates", piprop:"thumbnail", pithumbsize:"720", colimit:"1"
  });
  let image = "";
  let city = "";
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error("Wikipedia lookup failed");
    const json = await response.json();
    const page = Object.values(json.query?.pages || {})[0];
    image = page?.thumbnail?.source || "";
    const coord = page?.coordinates?.[0];
    if (coord) {
      const geoUrl = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
      geoUrl.searchParams.set("latitude", coord.lat);
      geoUrl.searchParams.set("longitude", coord.lon);
      geoUrl.searchParams.set("localityLanguage", "en");
      const geoResponse = await fetch(geoUrl);
      if (geoResponse.ok) {
        const geo = await geoResponse.json();
        city = geo.city || geo.locality || geo.principalSubdivision || "";
      }
    }
  } catch (error) {
    console.warn("Destination media lookup:", query, error);
  }
  if (!image) image = await fetchCommonsImage(query);
  const result = { image, city: city || englishPart(p.country) || "Worldwide" };
  mediaCache[p.rank] = result;
  saveMediaCache();
  return result;
}

function applyMedia(rank, media) {
  document.querySelectorAll(`[data-rank="${rank}"]`).forEach(card => {
    const img = card.querySelector(".place-image");
    const placeholder = card.querySelector(".image-placeholder");
    const city = card.querySelector(".gateway-city");
    if (img && media.image) {
      img.onerror = () => {
        img.hidden = true;
        if (placeholder) {
          placeholder.hidden = false;
          placeholder.textContent = "IMAGE COMING SOON";
        }
        delete mediaCache[rank];
        saveMediaCache();
      };
      img.src = media.image;
      img.hidden = false;
      if (placeholder) placeholder.hidden = true;
    } else if (placeholder) {
      placeholder.hidden = false;
      placeholder.textContent = "IMAGE COMING SOON";
    }
    if (city) city.textContent = media.city;
  });
}

function hydrateVisibleMedia() {
  if (mediaObserver) mediaObserver.disconnect();
  mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      mediaObserver.unobserve(entry.target);
      const rank = Number(entry.target.dataset.rank);
      const p = places.find(item => item.rank === rank);
      if (p) fetchMedia(p).then(media => applyMedia(rank, media));
    });
  }, {rootMargin:"500px 0px"});
  document.querySelectorAll(".place-card[data-rank]").forEach(card => mediaObserver.observe(card));
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited])); }

function descriptionFor(p) {
  const featured = {
    1:"高棉王朝留下的宏伟寺庙群，以日出塔影、回廊浮雕和丛林古迹闻名。",
    2:"世界最大的珊瑚礁生态系统，潜入海中可见绚丽珊瑚、海龟与热带鱼群。",
    3:"隐在安第斯山巅的印加古城，云雾、梯田与严丝合缝的石墙令人惊叹。",
    4:"横跨中国北方的古代防御体系，沿山脊起伏，凝聚两千多年的工程智慧。",
    5:"莫卧儿皇帝为爱妻修建的白色大理石陵墓，晨昏光线会改变它的色泽。",
    6:"科罗拉多河亿万年切割出的巨型峡谷，层层岩壁如同一部地球历史书。",
    7:"古罗马最具代表性的竞技场，拱券结构与地下通道仍诉说帝国时代盛况。",
    8:"横跨阿根廷与巴西的庞大瀑布群，站在“魔鬼咽喉”前可感受雷鸣般水势。",
    9:"摩尔王朝留下的宫殿城堡，繁复雕刻、静谧庭院与流水展现伊斯兰美学。",
    10:"跨越拜占庭与奥斯曼时代的建筑奇迹，巨型穹顶、马赛克和宣礼塔同框。",
    19:"1835年达尔文随“小猎犬号”考察这里，岛间巨龟与雀鸟的差异启发了他对物种演化和自然选择的思考。",
    97:"珍珠港保存着亚利桑那号战列舰残骸与纪念馆，记录1941年袭击事件及美国卷入第二次世界大战的历史转折。",
    120:"约52公里的高海拔圣山环线，通常用三天翻越卓玛拉垭口；冈仁波齐同时受到佛教、印度教、耆那教与苯教敬奉。",
    144:"自由女神像与埃利斯岛共同讲述美国移民史：前者象征自由，后者曾迎接逾千万名新移民。",
    267:"北美最高峰德纳里坐落于辽阔的亚寒带荒野，公园以冻原、冰川和灰熊、驼鹿等野生动物闻名。",
    323:"园内保存两千多座天然砂岩拱门，其中精致拱门已成为犹他州最具辨识度的自然地标。",
    330:"维埃克斯岛蚊子湾的甲藻受扰动时会发出蓝光，无月夜划艇最能看见水面如星河闪烁。",
    364:"维尔京河切开巨大的红色砂岩峡谷，天使降临与窄谷是锡安最经典的两种探索方式。",
    391:"四位美国总统的巨型头像雕刻在花岗岩山体上，是20世纪美国最醒目的国家纪念工程之一。",
    466:"冰川雕刻出尖峰、湖泊与U形谷，向阳大道横穿大陆分水岭，是公园最经典的景观路线。",
    475:"约6.8公里的世界级娱乐大道汇集巨型酒店、赌场、灯光秀和城市奇观，夜晚最具代表性。",
    210:"罗本岛曾长期作为政治犯监狱，纳尔逊·曼德拉在此被囚禁18年，如今是记录南非反种族隔离历史的世界遗产。",
    217:"西湖以湖光山色、苏堤白堤、古塔园林和历代诗文闻名，是中国传统山水审美与城市生活交融的典范。",
    248:"二世古以轻盈干燥的北海道粉雪闻名，四大雪场环绕安努普利山，滑行时还能远眺形似富士山的羊蹄山。",
    331:"张家界以数千座石英砂岩峰柱构成罕见峰林地貌，云雾升起时如同漂浮于天地之间。",
    514:"黄山以奇松、怪石、云海、温泉与冬雪闻名，花岗岩峰林塑造了中国山水画般的意境。",
    515:"桂林山水以漓江和喀斯特峰林为核心，乘船从桂林至阳朔可欣赏最经典的山水长卷。",
    516:"夔门是长江三峡西端的雄关，也是瞿塘峡入口，两岸绝壁夹江，素有“天下雄”之称。"
  };
  if (featured[p.rank]) return featured[p.rank];

  const name = String(p.name || "").split(" (")[0];
  const country = String(p.country || "").split(" (")[0];

  if (p.group === "节日庆典") return `${p.type}；现场的服饰、音乐与仪式，是理解当地文化最鲜活的方式。`;
  if (p.group === "徒步与朝圣") return `${p.type}；用双脚穿越地貌与村落，沿途风景往往比终点更令人难忘。`;
  if (p.group === "特色体验") return `${p.type}；它把自然、生活方式与在地文化浓缩成一次难以复制的经历。`;

  const rules = [
    [/瀑布/, `${name}以磅礴水势和层叠水幕著称，丰水期的轰鸣与水雾尤其震撼。`],
    [/峡谷/, `${name}由漫长地质作用塑造，峭壁、岩层与光影展现大自然的时间尺度。`],
    [/火山|火口|熔岩/, `${name}保存着鲜明的火山地貌，可近距离观察熔岩、火口与地球内部力量留下的痕迹。`],
    [/冰川|冰原|冰洞/, `${name}展现冰川侵蚀与流动形成的蓝冰世界，裂隙、冰壁和寒地景观极具冲击力。`],
    [/沙漠|沙丘/, `${name}以辽阔沙海和流动沙丘闻名，日出日落时的色彩与线条最具魅力。`],
    [/梯田/, `${name}顺山势层层铺展，既是农业智慧的结晶，也呈现四季变化的壮观大地纹理。`],
    [/湖|泻湖/, `${name}以开阔水面和周围地貌相映成景，天气与光线会赋予湖水不同色彩。`],
    [/珊瑚|礁/, `${name}拥有丰富的珊瑚生态与海洋生物，是浮潜、潜水和理解海洋生态的理想地点。`],
    [/岛|群岛|海岸|海滩|海湾/, `${name}融合海岸地貌、海洋生态与岛屿文化，适合放慢脚步深入探索。`],
    [/山|峰|高地|山脉/, `${name}以鲜明山势和开阔视野吸引旅行者，沿途还能观察海拔变化带来的生态差异。`],
    [/洞|洞窟|溶洞/, `${name}记录水、岩石与时间共同雕刻的地下世界，洞内结构与光影充满神秘感。`],
    [/森林|雨林|丛林/, `${name}保存着多层次森林生态，茂密植被、鸟兽与湿润气息构成沉浸式自然体验。`],
    [/国家公园|保护区|野生动物/, `${name}保护着${country}重要的自然生态，是观察地貌、植物与野生动物的代表区域。`],
    [/古城|遗址|废墟|考古/, `${name}保存着城市格局与文明遗迹，行走其间可以触摸当地历史最真实的层次。`],
    [/城堡|宫|堡垒|要塞/, `${name}将权力、战争与建筑艺术凝结在一起，内部空间和制高点景观同样值得细看。`],
    [/寺|教堂|清真寺|神社|佛|修道院/, `${name}融合信仰、历史与建筑艺术，细部装饰和仪式空间体现当地精神传统。`],
    [/博物馆|美术馆|纪念馆|纪念碑/, `${name}以展品、艺术或历史现场串联当地记忆，适合在短时间内读懂一座城市。`],
    [/市场|集市|老街|街区|广场/, `${name}汇集建筑、饮食与市井生活，是观察当地日常文化和城市节奏的窗口。`],
    [/铁路|火车|列车/, `${name}不仅连接目的地，本身也是旅程亮点，沿途地貌与人文景观不断变化。`],
    [/桥|塔|摩天楼/, `${name}以鲜明轮廓和工程设计成为城市象征，登高或远眺能获得经典视角。`]
  ];
  const matched = rules.find(([pattern]) => pattern.test(name));
  if (matched) return matched[1];

  const descriptions = {
    "自然景观":`${name}浓缩了${country}独特的地貌与自然气候，最适合在光线变化中慢慢欣赏。`,
    "自然保护地":`${name}守护着珍贵生态系统，可在相对原始的环境中观察当地动植物与自然演化。`,
    "历史遗产":`${name}见证当地重要历史阶段，建筑细节和空间格局仍保留着时代留下的密码。`,
    "宗教建筑":`${name}不仅是信仰场所，也是一部立体的建筑史，艺术细节与仪式氛围值得品味。`,
    "博物馆/纪念地":`${name}通过实物、艺术与故事呈现当地历史，是深入理解目的地的重要一站。`,
    "城市街区":`${name}把建筑、街巷和日常生活融为一体，步行探索最能发现城市真实气质。`,
    "地标/特色体验":`${name}集中体现${country}鲜明的地域特色，是认识当地风景与文化的经典入口。`
  };
  return descriptions[p.type] || `${name}兼具风景、文化与在地故事，是值得留出时间深入体验的一站。`;
}

let shareQrPromise = null;

function roundedRect(ctx,x,y,w,h,r,fill){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
}

function getShareQr(){
  if(shareQrPromise)return shareQrPromise;
  shareQrPromise=new Promise(resolve=>{
    const finish=src=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;};
    if(window.QRCode){
      const holder=document.createElement("div");
      holder.style.cssText="position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(holder);
      new QRCode(holder,{text:"https://bayfamily2020.github.io/travel/",width:240,height:240,colorDark:"#17211b",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
      setTimeout(()=>{const canvas=holder.querySelector("canvas");const image=holder.querySelector("img");const src=canvas?.toDataURL("image/png")||image?.src||"";holder.remove();src?finish(src):resolve(null);},80);
    }else{
      const img=new Image();img.crossOrigin="anonymous";img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data="+encodeURIComponent("https://bayfamily2020.github.io/travel/");
    }
  });
  return shareQrPromise;
}

async function drawShareCard(score,max,progress,level){
  const canvas=$("share-card");if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const done=places.filter(p=>visited.has(p.rank));
  const countryCount=new Set(done.map(p=>String(p.country).split(/\s*[\/(（]/)[0].trim()).filter(Boolean)).size;
  const continentCount=new Set(done.map(p=>p.continent).filter(Boolean)).size;
  const famousCount=done.filter(p=>p.points===2).length;
  ctx.clearRect(0,0,1080,1350);ctx.fillStyle="#173b31";ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle="rgba(221,107,61,.16)";ctx.beginPath();ctx.arc(970,100,300,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="rgba(255,255,255,.04)";for(let x=-100;x<1200;x+=72)for(let y=0;y<1350;y+=72)ctx.fillRect(x+((y/72)%2)*36,y,3,3);
  ctx.strokeStyle="#ef8458";ctx.lineWidth=5;ctx.beginPath();ctx.arc(105,100,55,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#ff9a69";ctx.font="700 28px Georgia";ctx.textAlign="center";ctx.fillText("W650",105,110);
  ctx.textAlign="left";ctx.fillStyle="#d7e1d9";ctx.font="600 25px sans-serif";ctx.fillText("环球旅行达人测评",185,95);
  ctx.fillStyle="#9fb5a7";ctx.font="20px sans-serif";ctx.fillText("MY WORLD TRAVEL FOOTPRINT",185,128);
  ctx.fillStyle="#fff";ctx.font='700 62px "Microsoft YaHei",sans-serif';ctx.fillText("我的环球旅行足迹",72,220);
  ctx.fillStyle="#ef8458";let shareLevelFont=152;ctx.font=`700 ${shareLevelFont}px "Microsoft YaHei",sans-serif`;const levelWidth=ctx.measureText(level).width;if(levelWidth>936){shareLevelFont=Math.floor(shareLevelFont*936/levelWidth);ctx.font=`700 ${shareLevelFont}px "Microsoft YaHei",sans-serif`;}ctx.fillText(level,72,385);
  ctx.fillStyle="#bfd0c3";ctx.font="24px sans-serif";ctx.fillText("当前旅行段位",76,430);
  roundedRect(ctx,72,470,936,170,28,"rgba(255,255,255,.08)");
  ctx.fillStyle="#fff";ctx.font="700 76px Georgia";ctx.fillText(String(score),112,562);
  ctx.fillStyle="#b9cabe";ctx.font="22px sans-serif";ctx.fillText("/ "+max+" 得分",112,606);
  ctx.textAlign="right";ctx.fillStyle="#fff";ctx.font="700 76px Georgia";ctx.fillText(progress+"%",968,562);
  ctx.fillStyle="#b9cabe";ctx.font="22px sans-serif";ctx.fillText("环球完成度",968,606);ctx.textAlign="left";
  const stats=[["已打卡项目",done.length],["国家／地区",countryCount],["覆盖大洲",continentCount],["经典项目",famousCount]];
  stats.forEach(([label,value],i)=>{const x=72+(i%2)*476,y=682+Math.floor(i/2)*158;roundedRect(ctx,x,y,460,136,22,"rgba(255,255,255,.07)");ctx.fillStyle="#fff";ctx.font="700 52px Georgia";ctx.fillText(String(value),x+30,y+70);ctx.fillStyle="#b9cabe";ctx.font="22px sans-serif";ctx.fillText(label,x+30,y+108);});
  roundedRect(ctx,72,1012,250,250,20,"#fff");
  const qr=await getShareQr();if(qr)ctx.drawImage(qr,87,1027,220,220);
  ctx.fillStyle="#fff";ctx.font='700 34px "Microsoft YaHei",sans-serif';ctx.fillText("扫码测测你的旅行段位",365,1100);
  ctx.fillStyle="#bfd0c3";ctx.font="23px sans-serif";ctx.fillText("650项环球旅行目的地与体验",365,1145);
  ctx.fillStyle="#ff9a69";ctx.font="22px sans-serif";ctx.fillText("bayfamily2020.github.io/travel/",365,1202);
  ctx.fillStyle="#8fa99a";ctx.font="18px sans-serif";ctx.fillText("数据仅保存在你的浏览器中",365,1242);
  ctx.fillStyle="#ef8458";ctx.fillRect(0,1335,1080,15);
}

function shareCanvasBlob(){
  return new Promise(resolve=>$("share-card").toBlob(resolve,"image/png",1));
}

async function downloadShareCard(){
  const status=$("share-status");if(status)status.textContent="正在生成图片…";
  const blob=await shareCanvasBlob();if(!blob){if(status)status.textContent="图片生成失败，请稍后重试。";return;}
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="我的环球旅行足迹.png";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(status)status.textContent="图片已生成，可以分享到朋友圈。";
}

async function shareTravelCard(){
  const status=$("share-status");if(status)status.textContent="正在准备分享卡片…";
  const blob=await shareCanvasBlob();if(!blob){if(status)status.textContent="图片生成失败，请稍后重试。";return;}
  const file=new File([blob],"我的环球旅行足迹.png",{type:"image/png"});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    try{await navigator.share({title:"我的环球旅行足迹",text:"测测你是真正的旅行达人吗？",files:[file]});if(status)status.textContent="分享卡片已打开。";}catch(error){if(error.name!=="AbortError"&&status)status.textContent="未能直接分享，请使用“保存图片”。";}
  }else{await downloadShareCard();if(status)status.textContent="当前浏览器不支持直接分享，图片已保存。";}
}

function updateSummary() {
  const score = places.reduce((sum, p) => sum + (visited.has(p.rank) ? p.points : 0), 0);
  const max = places.reduce((sum, p) => sum + p.points, 0);
  const progress = max ? Math.round(score / max * 1000) / 10 : 0;
  $("count").textContent = visited.size;
  $("score").textContent = score;
  $("max-score").textContent = `/ ${max} 得分`;
  $("progress").textContent = `${progress}%`;
  $("progress-bar").style.width = `${progress}%`;
  const levels = [[2,"工位钉子户"],[4,"家养牛马"],[6,"井底观察员"],[8,"探头的土拨鼠"],[10,"驿站的菜鸟"],[12,"年假特种兵"],[14,"出逃的羊驼"],[16,"奔跑的走地鸡"],[18,"跨国流窜犯"],[20,"人形行李箱"],[30,"迁徙的羚羊"],[40,"漂流的海龟"],[50,"追风的北极燕鸥"],[60,"洄游的灰鲸"],[70,"地球街溜子"],[85,"伊本·白图泰"]];
  const level = progress >= 85 ? "外星人探针" : levels.find(([limit]) => progress < limit)[1];
  $("level").textContent = level;
  if ($("final-score")) $("final-score").textContent = score;
  if ($("final-max-score")) $("final-max-score").textContent = `/ ${max} 得分`;
  if ($("final-progress")) $("final-progress").textContent = `${progress}%`;
  if ($("final-level")) $("final-level").textContent = level;
  drawShareCard(score, max, progress, level);
}

function renderPagination(total) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const options = Array.from({length:totalPages}, (_,i) => `<option value="${i+1}" ${currentPage === i+1 ? "selected" : ""}>第 ${i+1} / ${totalPages} 页</option>`).join("");
  const markup = `<button type="button" data-page="${currentPage-1}" ${currentPage === 1 ? "disabled" : ""}>← 上一页</button><label><span>页面</span><select data-page-jump aria-label="选择页码">${options}</select></label><button type="button" data-page="${currentPage+1}" ${currentPage === totalPages ? "disabled" : ""}>下一页 →</button>`;
  document.querySelectorAll(".pagination").forEach(el => { el.innerHTML = markup; el.hidden = total === 0; });
}

function render() {
  const q = $("query").value.trim().toLowerCase();
  const continent = $("continent").value, group = $("group").value;
  const fame = $("fame").value, status = $("status").value, sort = $("sort").value;
  const filtered = places.filter(p => {
    const done = visited.has(p.rank);
    const haystack = `${p.name} ${p.country} ${p.type} ${p.group} ${descriptionFor(p)}`.toLowerCase();
    return (!q || haystack.includes(q)) && (continent === "全部" || p.continent === continent) && (group === "全部类型" || p.group === group) && (fame === "全部" || (fame === "此生必去" ? p.points === 2 : fame === "不去也行" ? p.points === 1 : p.fame.startsWith(fame))) && (status === "全部" || (status === "已去" ? done : !done));
  }).sort((a,b) => sort === "points" ? b.points-a.points || a.rank-b.rank : sort === "country" ? a.country.localeCompare(b.country,"zh-CN") : a.rank-b.rank);
  renderPagination(filtered.length);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const end = start + pageItems.length;
  $("shown").textContent = filtered.length ? `${start + 1}–${end} / ${filtered.length} 个项目` : "0 个项目";
  $("empty").hidden = filtered.length !== 0;
  $("grid").innerHTML = pageItems.map(p => {
    const done = visited.has(p.rank);
    const media = seededMedia(p);
    const image = media?.image || "";
    const city = media?.city || "Locating…";
    return `<button class="place-card ${done ? "done" : ""} with-image" data-rank="${p.rank}" aria-pressed="${done}"><span class="image-wrap"><img class="place-image" ${image ? `src="${escapeHtml(image)}"` : "hidden"} alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><span class="image-placeholder" ${image ? "hidden" : ""}>EXPLORE</span><span class="image-credit">Wikimedia Commons</span></span><span class="rank">#${String(p.rank).padStart(3,"0")}</span><span class="points p${p.points}">${p.points} 分</span><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><span class="place-name">${escapeHtml(p.name)}</span><span class="meta"><b>${escapeHtml(p.continent)}</b> · ${escapeHtml(p.country)}</span><span class="gateway"><b>Gateway city</b> · <span class="gateway-city">${escapeHtml(city)}</span></span><span class="description">${escapeHtml(descriptionFor(p))}</span><span class="type">${escapeHtml(p.group)} · ${escapeHtml(p.type)}</span>${p.evidence ? '<span class="evidence">已有旅行记录</span>' : ""}</button>`;
  }).join("");
  hydrateVisibleMedia();
  updateSummary();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const chunks = await Promise.all(Array.from({length:13}, (_,i) => fetch(`./data-${i}.json?v=20260818-score-force2`, {cache:"no-store"}).then(r => r.json())));
    places = chunks.flat();
    const forcedOnePointRanks = new Set([517,520,586,607]);
    places.forEach(p => { if (forcedOnePointRanks.has(p.rank)) { p.points = 1; p.fame = "不去也行"; } });
    const base = places.slice(0, 500);
    const saved = localStorage.getItem(STORAGE_KEY);
    visited = new Set(saved ? JSON.parse(saved) : base.filter(p => p.visited).map(p => p.rank));
    document.querySelectorAll(".filters input,.filters select").forEach(el => el.addEventListener("input", () => { currentPage = 1; render(); }));
    const countryShortcut = $("country-sort-shortcut");
    if (countryShortcut) countryShortcut.addEventListener("click", () => { $("sort").value = "country"; currentPage = 1; render(); });
    document.querySelectorAll(".pagination").forEach(pager => {
      pager.addEventListener("click", e => { const button = e.target.closest("[data-page]"); if (!button || button.disabled) return; currentPage = Number(button.dataset.page); render(); $("list").scrollIntoView({behavior:"smooth"}); });
      pager.addEventListener("change", e => { if (!e.target.matches("[data-page-jump]")) return; currentPage = Number(e.target.value); render(); $("list").scrollIntoView({behavior:"smooth"}); });
    });
    $("grid").addEventListener("click", e => { const card=e.target.closest("[data-rank]"); if(!card)return; const rank=Number(card.dataset.rank); visited.has(rank)?visited.delete(rank):visited.add(rank); save(); render(); });
    $("reset").addEventListener("click", () => { if(confirm("确定要清空这个浏览器里的全部打卡记录吗？")){visited.clear();save();render();} });
    $("download-card-button")?.addEventListener("click", downloadShareCard);
    $("share-card-button")?.addEventListener("click", shareTravelCard);
    render();
  } catch (error) {
    $("grid").innerHTML = '<div class="empty">数据加载失败，请刷新页面重试。</div>';
    console.error(error);
  }
});
