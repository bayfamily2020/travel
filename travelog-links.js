// BayFamily WeChat travelog links matched to destinations in the W650 list.
// A journey series is intentionally shared by every relevant stop on that route.
(function () {
  const article = (title, url) => ({ title, url });

  const rio = article("里约热内卢狂欢节杀人事件（一）", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247484721&idx=1&sn=7a01a34af489001fa2d31ed0748b6a0a&chksm=e99d072fdeea8e396f7e5ea3cba9e30089ff1a1d92057367878e5ea33846b1365e274f0e13632#rd");
  const madagascar = article("我们为什么要投机？香草国游记一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247484851&idx=1&sn=e0badac829246200324b0fc2849877a4&chksm=e99d07addeea8ebbf65550550269068d55dc4f0ea26caffe70a9adb50769ce5a4ae272b5b986#rd");
  const socotra = article("无处不在的浪费，龙血岛之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485451&idx=1&sn=5602503b0c5ce3e235aac873dc881093&chksm=e99d0a15deea8303129ee9e7bf77c17aee213923648047147445b8ec43d35a5b6a1e7d8848d6#rd");
  const camino = article("西班牙朝圣之旅之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485624&idx=1&sn=6864d856c3de862117806509eb6204de&chksm=e99d0aa6deea83b0a7c7c2a4b170079f02ab7a740faccb05e6d1302b19e32f56c0b473042418#rd");
  const mostar = article("为什么从历史学不到教训 Mostar", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485649&idx=1&sn=93afc93cf62c39bb2b49822dbced9439&chksm=e99d0acfdeea83d9c8e4257040f94cfdd723c6aafcbde30189bcfe4864cba617ca998329e431#rd");
  const prague = article("卡夫卡也被催婚 布拉格之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485668&idx=1&sn=30768faad059d9f045eac79379fc6c9a&chksm=e99d0afadeea83ecd5a9e8681a7e464424114bd8c47d0011f551a335abcb9bd69262a6044b0c#rd");
  const budapest = article("男女混浴感叹 布达佩斯游记", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485707&idx=1&sn=66d475b4523146bf227ddb9dcfdd9ee7&chksm=e99d0b15deea8203ccc94aab18905b53977aa1a72d686d33f723f244038cceaa3dd82a844082#rd");
  const iceland = article("这里的夏天真冷 冰岛之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247485900&idx=1&sn=b90fdb755634f2e3d019c9d01277f356&chksm=e99d0bd2deea82c455761129215d740f911170a0eab06cf3264d9e1dfcefa99512c3298b21ee#rd");
  const kotor = article("比克罗地亚更美的科特尔城", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247486052&idx=1&sn=92bf07aefbac1e978b44cf517c96eb59&chksm=e99d087adeea816cfc154f3a7daa71e940061785ee890a6675561c1f6169280500426dbf31ed#rd");
  const tahiti = article("太平洋椰奶航线 大溪地之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247486129&idx=1&sn=504a7df74ba216586f93040025a62af0&chksm=e99d08afdeea81b9574dba7c3d287a14c92335b7382ec529df24945cc2f56aeb7baec0447344#rd");
  const fiji = article("为什么总是黑的服务白的？斐济", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247486164&idx=1&sn=ca9d1fc8711799f6d5b7f72079526a0b&chksm=e99d08cadeea81dc7e13e4d2cde57cc6fc371348622ed2cd429878b7f38500ffdb8ddac85b2a#rd");
  const samoa = article("人类最后的避难所 萨摩亚一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247486185&idx=1&sn=54ca01d317b1a5abc92161c5f54f973b&chksm=e99d08f7deea81e1c0899f91b3de8c594496bf6eaddc33a15be1c829c2e1f9fc1eb137898328#rd");
  const hiroshima = article("如何在核大战中幸存？广岛之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247486441&idx=1&sn=4c1a27477897a2d6c3e4f1db4a9f4487&chksm=e99d09f7deea80e1c5a31cf76ec374d7b0cbedb2c98e1a6386ddce3d67bd11e78718bc6c5644#rd");
  const threeGorges = article("当下最大的时代红利是什么？三峡之巅徒步", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247487454&idx=1&sn=94da1acaebb06375849af3f18e568fe3&chksm=e99d0dc0deea84d6209f911cdc18c008ca272bd62a8189a8f1752f93dc7829d5b3d025e6ea3c#rd");
  const kumano = article("人活着就是要吃苦 熊野徒步之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247488587&idx=1&sn=af841864843fa847646530c9323e471e&chksm=e99d1655deea9f43f2407e68312e0cdb12c86d827cb263ed007f8b2e60f120690d6c96ff7357#rd");
  const borobudur = article("世上最震撼的佛教遗址，婆罗浮屠", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247489886&idx=1&sn=ff29e5a6e5acb509362a0d57fbda4b25&chksm=e99d1b40deea9256d23f5cf2761ec29557dea724242e294b170cc4e5dccfef13a7e1e06a9824#rd");
  const jokhang = article("密宗的快速成佛 大昭寺", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247490028&idx=1&sn=121609fc04b7c9b3907baa19089a14a2&chksm=e99d1bf2deea92e4eacce0e6568b8d4dc2736dd46341e4bf973692f5265a459db44db318cdc6#rd");
  const kinkakuji = article("禅宗崇尚自然 京都金阁寺", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247490079&idx=1&sn=8723aacd8084cd2b238b0874849f58bf&chksm=e99d1801deea9117e4ba648df8bb58a98ae17ab185e40fa39c06d9b00df3afabc81da1432767#rd");
  const norway = article("挪威的森林（一）", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247490195&idx=1&sn=78406849cedf26cd938d03cc70a8077f&chksm=e99d188ddeea919b93dc92e49a6a4538cb66436a181fd8f6f6d515887e26631c212dead4dc10#rd");
  const komodo = article("我们为啥怕太阳？科莫多岛之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247490410&idx=1&sn=b327d1e89553b788c4e632d97c679f21&chksm=e99d1974deea9062eac72501dad3bf44805bf3d3360b12c2ebd901eb90f85403c7ef1c02df7b#rd");
  const dolomites = article("恐惧来自预期，勇气来自体验 意大利AV1徒步之一", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247491052&idx=1&sn=c1b90a8956bd0732ac0d8a30352191a4&chksm=e99d1ff2deea96e4551f671787a53f8b6627a48abcdc32734fac610b6048f5aa52eb61303650#rd");
  const namibia = article("男人比女人更美？纳米比亚自驾第0&1天", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247491124&idx=1&sn=4cab111f6888504ba7619acb699d0d47&chksm=e99d1c2adeea953c35f2dd03b4d0e91d6196207ca6b5a8c2e9cb7b623cd373e4f087f5ae32b2#rd");
  const victoriaFalls = article("瀑布最炸裂的玩法 赞比亚之维多利亚瀑布", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247491302&idx=1&sn=197c268d70d8f2257479117383402f01&chksm=e99d1cf8deea95ee82b7d8adbd83ffcf519f7476277f931b7a47d07be1621acbf1e60e906602#rd");
  const capeTown = article("股灾与好望角 开普敦第一天", "https://mp.weixin.qq.com/s?__biz=MzI0ODczMTUwNQ==&mid=2247491902&idx=1&sn=166467380d1063b9057d67b5c017e2fa&chksm=e99ee320dee96a364c47207fb2f70c36f8ae6a8786de506a6b174cee92a87678df45d0f813f1#rd");

  const links = {
    27:victoriaFalls, 34:prague, 43:capeTown, 44:prague, 47:kotor, 50:hiroshima,
    60:iceland, 93:iceland, 108:tahiti, 110:budapest, 113:mostar, 124:norway,
    135:norway, 145:iceland, 172:prague, 175:kinkakuji, 176:iceland, 210:capeTown,
    211:iceland, 212:namibia, 216:norway, 242:borobudur, 250:iceland, 284:fiji,
    290:socotra, 302:madagascar, 319:norway, 334:jokhang, 350:tahiti, 351:iceland,
    359:iceland, 383:camino, 384:komodo, 385:madagascar, 415:namibia, 426:namibia,
    434:fiji, 444:kotor, 476:samoa, 494:norway, 495:namibia, 502:rio,
    516:threeGorges, 561:camino, 566:kumano, 596:dolomites, 598:iceland, 648:norway
  };

  window.BAY_TRAVELOGS = Object.freeze(links);
})();
