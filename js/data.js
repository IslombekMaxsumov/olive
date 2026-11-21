/* The recipe book's content.

   INGREDIENTS: every ingredient once, with its name in English, Russian and
   Uzbek and the shop aisle it belongs to (used to group the shopping list).
   "staple" ingredients (water, salt, pepper, oil) are in every kitchen, so
   the ingredient search ignores them and the shopping list skips them.

   RECIPES: amounts are for `serves` people; the servings calculator scales
   them. A step can have `min` for a cooking timer. `level`: 1 easy, 2 medium,
   3 takes practice. `kcal` is per serving (approximate).

   The Uzbek and Russian text still needs a native speaker's proofreading. */
(function () {
  "use strict";

  // id: [English, Russian, Uzbek, aisle, staple?]
  const I = {
    rice: ["rice", "рис", "guruch", "grains"],
    flour: ["flour", "мука", "un", "grains"],
    pasta: ["pasta", "макароны", "makaron", "grains"],
    mung: ["mung beans", "маш", "mosh", "grains"],
    chickpeas: ["chickpeas", "нут", "no'xat", "grains"],
    yeast: ["dry yeast", "сухие дрожжи", "quruq xamirturush", "grains"],
    sugar: ["sugar", "сахар", "shakar", "grains"],
    beef: ["beef", "говядина", "mol go'shti", "meat"],
    lamb: ["lamb", "баранина", "qo'y go'shti", "meat"],
    mince: ["minced meat", "фарш", "qiyma", "meat"],
    chicken: ["chicken", "курица", "tovuq", "meat"],
    onion: ["onion", "лук", "piyoz", "produce"],
    carrot: ["carrot", "морковь", "sabzi", "produce"],
    potato: ["potato", "картофель", "kartoshka", "produce"],
    tomato: ["tomato", "помидор", "pomidor", "produce"],
    cucumber: ["cucumber", "огурец", "bodring", "produce"],
    pepper: ["bell pepper", "болгарский перец", "bolgar qalampiri", "produce"],
    cabbage: ["cabbage", "капуста", "karam", "produce"],
    beet: ["beetroot", "свёкла", "lavlagi", "produce"],
    garlic: ["garlic", "чеснок", "sarimsoq", "produce"],
    pumpkin: ["pumpkin", "тыква", "qovoq", "produce"],
    apple: ["apple", "яблоко", "olma", "produce"],
    lemon: ["lemon", "лимон", "limon", "produce"],
    dill: ["dill", "укроп", "shivit", "produce"],
    cilantro: ["cilantro", "кинза", "kashnich", "produce"],
    parsley: ["parsley", "петрушка", "petrushka", "produce"],
    egg: ["egg", "яйцо", "tuxum", "dairy"],
    milk: ["milk", "молоко", "sut", "dairy"],
    butter: ["butter", "сливочное масло", "sariyog'", "dairy"],
    sourcream: ["sour cream", "сметана", "smetana", "dairy"],
    tvorog: ["cottage cheese", "творог", "tvorog", "dairy"],
    feta: ["feta cheese", "брынза", "brinza", "dairy"],
    cheese: ["hard cheese", "твёрдый сыр", "qattiq pishloq", "dairy"],
    olives: ["olives", "оливки", "zaytun", "pantry"],
    tomatopaste: ["tomato paste", "томатная паста", "tomat pastasi", "pantry"],
    sesame: ["sesame seeds", "кунжут", "kunjut", "pantry"],
    cumin: ["cumin", "зира", "zira", "spices"],
    paprika: ["paprika", "паприка", "paprika", "spices"],
    oil: ["vegetable oil", "растительное масло", "o'simlik yog'i", "pantry", true],
    salt: ["salt", "соль", "tuz", "spices", true],
    blackpepper: ["black pepper", "чёрный перец", "qora murch", "spices", true],
    water: ["water", "вода", "suv", "pantry", true],
  };
  const INGREDIENTS = {};
  Object.entries(I).forEach(([id, [en, ru, uz, aisle, staple]]) => {
    INGREDIENTS[id] = { id, name: { en, ru, uz }, aisle, staple: Boolean(staple) };
  });

  // A step: [English, Russian, Uzbek, timer minutes (optional)]
  const R = [
    {
      id: "plov", cat: "main", cuisine: "uz", time: 120, level: 3, serves: 6, kcal: 680, veg: false,
      name: ["Plov", "Плов", "Osh (palov)"],
      about: ["The festive rice dish of Uzbekistan: rice slowly steamed over meat, carrots and onion.",
        "Праздничное блюдо Узбекистана: рис, томлённый над мясом, морковью и луком.",
        "O'zbekistonning bayram taomi: go'sht, sabzi va piyoz ustida dimlangan guruch."],
      items: [["rice", 600, "g"], ["beef", 600, "g"], ["carrot", 600, "g"], ["onion", 2, "pcs"], ["garlic", 2, "head"], ["chickpeas", 100, "g"], ["cumin", 1, "tbsp"], ["oil", 150, "ml"], ["salt", 2, "tsp"], ["water", 900, "ml"]],
      steps: [
        ["Soak the chickpeas overnight. Wash the rice until the water runs clear and soak it for an hour.", "Замочите нут на ночь. Промойте рис до прозрачной воды и замочите на час.", "No'xatni bir kecha ivitib qo'ying. Guruchni suv tiniq bo'lguncha yuvib, bir soat iviting.", 60],
        ["Heat the oil in a heavy pot (kazan). Fry the meat in large pieces until brown.", "Раскалите масло в казане. Обжарьте мясо крупными кусками до корочки.", "Qozonda yog'ni qizdiring. Go'shtni katta bo'laklarda qizarguncha qovuring.", 10],
        ["Add the onion rings, then the carrot cut into thin sticks. Fry without stirring too much.", "Добавьте лук кольцами, затем морковь соломкой. Обжаривайте, почти не перемешивая.", "Halqa qilib to'g'ralgan piyozni, keyin ingichka to'g'ralgan sabzini soling. Ko'p aralashtirmay qovuring.", 10],
        ["Add the chickpeas, cumin, salt and hot water. Let it simmer: this is the zirvak.", "Добавьте нут, зиру, соль и горячую воду. Тушите: это зирвак.", "No'xat, zira, tuz va issiq suv qo'shing. Sekin qaynatib turing: bu zirvak.", 40],
        ["Spread the rice evenly on top, push in whole garlic heads and add water to cover the rice by 1 cm.", "Ровно выложите рис, вдавите целые головки чеснока и долейте воду на 1 см выше риса.", "Guruchni tekis yoying, butun sarimsoqni botiring va guruchdan 1 sm yuqori suv qo'shing."],
        ["When the water is gone, make a dome of the rice, cover tightly and steam on the lowest heat.", "Когда вода уйдёт, соберите рис горкой, плотно накройте и томите на самом слабом огне.", "Suv qolmagach, guruchni gumbaz qilib yig'ing, qopqoqni zich yoping va past olovda dimlang.", 25],
      ],
    },
    {
      id: "lagman", cat: "main", cuisine: "uz", time: 90, level: 3, serves: 4, kcal: 620, veg: false,
      name: ["Lagman", "Лагман", "Lag'mon"],
      about: ["Hand-pulled noodles under a thick sauce of beef, peppers and tomatoes.",
        "Тянутая лапша с густым соусом из говядины, перца и помидоров.",
        "Qo'lda cho'zilgan ugra, ustidan mol go'shti, qalampir va pomidorli quyuq sous."],
      items: [["flour", 500, "g"], ["egg", 1, "pcs"], ["beef", 400, "g"], ["pepper", 2, "pcs"], ["tomato", 3, "pcs"], ["onion", 1, "pcs"], ["garlic", 3, "clove"], ["carrot", 1, "pcs"], ["oil", 60, "ml"], ["salt", 2, "tsp"], ["water", 250, "ml"]],
      steps: [
        ["Knead a stiff dough from the flour, egg, salt and water. Cover it and let it rest.", "Замесите крутое тесто из муки, яйца, соли и воды. Накройте и дайте отдохнуть.", "Un, tuxum, tuz va suvdan qattiq xamir qoring. Yopib, dam oldiring.", 30],
        ["Cut the beef and vegetables into small cubes.", "Нарежьте говядину и овощи небольшими кубиками.", "Mol go'shti va sabzavotlarni mayda kubik qilib to'g'rang."],
        ["Fry the beef in hot oil, add the onion, carrot and peppers, then the tomatoes and garlic. Add a little water and simmer.", "Обжарьте говядину в горячем масле, добавьте лук, морковь и перец, затем помидоры и чеснок. Влейте немного воды и тушите.", "Go'shtni qizigan yog'da qovuring, piyoz, sabzi va qalampirni, keyin pomidor va sarimsoqni qo'shing. Ozroq suv quyib dimlang.", 25],
        ["Roll the dough into thin ropes, oil them and pull them into long noodles.", "Раскатайте тесто в тонкие жгуты, смажьте маслом и вытяните в длинную лапшу.", "Xamirni ingichka arqoncha qilib yoying, yog' surting va uzun ugra qilib cho'zing."],
        ["Boil the noodles in salted water, drain and serve with the sauce on top.", "Отварите лапшу в подсолённой воде, откиньте и подавайте с соусом сверху.", "Ugrani tuzli suvda qaynating, suvini to'kib, ustiga sous solib torting.", 4],
      ],
    },
    {
      id: "manti", cat: "main", cuisine: "uz", time: 100, level: 2, serves: 5, kcal: 560, veg: false,
      name: ["Manti", "Манты", "Manti"],
      about: ["Large steamed dumplings filled with juicy minced meat and lots of onion.",
        "Большие паровые пельмени с сочным фаршем и большим количеством лука.",
        "Ko'p piyoz qo'shilgan suvli qiymali katta bug'li chuchvaralar."],
      items: [["flour", 500, "g"], ["egg", 1, "pcs"], ["mince", 600, "g"], ["onion", 4, "pcs"], ["pumpkin", 200, "g"], ["butter", 50, "g"], ["cumin", 1, "tsp"], ["salt", 2, "tsp"], ["blackpepper", 1, "tsp"], ["water", 220, "ml"]],
      steps: [
        ["Make a smooth dough from the flour, egg, water and a pinch of salt. Let it rest.", "Замесите гладкое тесто из муки, яйца, воды и щепотки соли. Дайте отдохнуть.", "Un, tuxum, suv va bir chimdim tuzdan silliq xamir qoring. Dam oldiring.", 20],
        ["Chop the onion and pumpkin finely and mix with the mince, cumin, salt and pepper.", "Мелко нарежьте лук и тыкву, смешайте с фаршем, зирой, солью и перцем.", "Piyoz va qovoqni mayda to'g'rab, qiyma, zira, tuz va murch bilan aralashtiring."],
        ["Roll the dough thin, cut it into squares, put a spoon of filling and a piece of butter on each and pinch the corners together.", "Тонко раскатайте тесто, нарежьте квадратами, положите ложку начинки и кусочек масла и защипните углы.", "Xamirni yupqa yoyib, kvadrat qilib kesing, har biriga bir qoshiq qiyma va sariyog' solib, burchaklarini qisib yoping."],
        ["Oil the steamer trays, set the manti apart and steam them.", "Смажьте ярусы мантоварки маслом, разложите манты и готовьте на пару.", "Mantiqasqon qavatlarini yog'lab, mantilarni oralatib tering va bug'da pishiring.", 45],
        ["Serve hot with sour cream or a spicy tomato sauce.", "Подавайте горячими со сметаной или острым томатным соусом.", "Issiq holda smetana yoki achchiq tomat sousi bilan torting."],
      ],
    },
    {
      id: "samsa", cat: "baking", cuisine: "uz", time: 80, level: 2, serves: 8, kcal: 390, veg: false,
      name: ["Samsa", "Самса", "Somsa"],
      about: ["Flaky baked pastries with a spiced meat and onion filling, topped with sesame.",
        "Слоёные пирожки из духовки с мясом, луком и специями, посыпанные кунжутом.",
        "Ichiga ziravorli go'sht va piyoz solingan, kunjut sepilgan qatlamali pishiriq."],
      items: [["flour", 500, "g"], ["butter", 150, "g"], ["lamb", 500, "g"], ["onion", 3, "pcs"], ["egg", 1, "pcs"], ["sesame", 2, "tbsp"], ["cumin", 1, "tsp"], ["salt", 2, "tsp"], ["water", 250, "ml"]],
      steps: [
        ["Knead a dough from the flour, water and salt. Roll it out very thin, spread soft butter on it and roll it up tightly. Chill it.", "Замесите тесто из муки, воды и соли. Очень тонко раскатайте, смажьте мягким маслом и плотно сверните рулетом. Охладите.", "Un, suv va tuzdan xamir qoring. Juda yupqa yoyib, yumshoq sariyog' surting va zich o'rang. Sovuting.", 30],
        ["Cut the lamb and onion into small cubes and season with cumin, salt and pepper.", "Нарежьте баранину и лук мелкими кубиками, приправьте зирой, солью и перцем.", "Qo'y go'shti va piyozni mayda to'g'rab, zira, tuz va murch bilan ziravorlang."],
        ["Slice the roll into pieces, flatten each one, add filling and fold into a triangle.", "Нарежьте рулет на кусочки, раскатайте каждый, положите начинку и сложите треугольником.", "Rulonni bo'laklarga kesing, har birini yoying, ichiga qiyma solib uchburchak qilib buklang."],
        ["Brush with beaten egg, sprinkle with sesame and bake at 200 °C until golden.", "Смажьте взбитым яйцом, посыпьте кунжутом и выпекайте при 200 °C до золотистого цвета.", "Ustiga tuxum surtib, kunjut seping va 200 °C da tillarang bo'lguncha pishiring.", 30],
      ],
    },
    {
      id: "shurpa", cat: "soup", cuisine: "uz", time: 120, level: 1, serves: 6, kcal: 420, veg: false,
      name: ["Shurpa", "Шурпа", "Sho'rva"],
      about: ["A clear, rich lamb soup with big pieces of potato, carrot and fresh herbs.",
        "Прозрачный наваристый суп из баранины с крупными кусками картофеля, моркови и зеленью.",
        "Katta bo'lak kartoshka, sabzi va ko'katli tiniq, quyuq qo'y go'shti sho'rvasi."],
      items: [["lamb", 700, "g"], ["potato", 4, "pcs"], ["carrot", 2, "pcs"], ["onion", 2, "pcs"], ["tomato", 2, "pcs"], ["pepper", 1, "pcs"], ["chickpeas", 100, "g"], ["cilantro", 1, "bunch"], ["salt", 2, "tsp"], ["water", 3, "l"]],
      steps: [
        ["Put the lamb and soaked chickpeas in cold water, bring to the boil and skim off the foam.", "Залейте баранину и замоченный нут холодной водой, доведите до кипения и снимите пену.", "Qo'y go'shti va ivitilgan no'xatni sovuq suvga solib qaynating va ko'pigini oling.", 15],
        ["Simmer gently on low heat so the broth stays clear.", "Варите на слабом огне, чтобы бульон остался прозрачным.", "Sho'rva tiniq bo'lishi uchun past olovda sekin qaynatib turing.", 60],
        ["Add the onion, carrot and pepper in big pieces, then the potatoes and tomatoes.", "Добавьте крупно нарезанные лук, морковь и перец, затем картофель и помидоры.", "Katta to'g'ralgan piyoz, sabzi va qalampirni, keyin kartoshka va pomidorni soling.", 30],
        ["Salt to taste, sprinkle with chopped cilantro and serve with fresh bread.", "Посолите по вкусу, посыпьте рубленой кинзой и подавайте со свежим хлебом.", "Ta'bga ko'ra tuz soling, to'g'ralgan kashnich sepib, yangi non bilan torting."],
      ],
    },
    {
      id: "mastava", cat: "soup", cuisine: "uz", time: 60, level: 1, serves: 5, kcal: 380, veg: false,
      name: ["Mastava", "Машхурда-мастава", "Mastava"],
      about: ["A thick rice soup with beef and vegetables, served with sour cream.",
        "Густой рисовый суп с говядиной и овощами, подаётся со сметаной.",
        "Mol go'shti va sabzavotli quyuq guruchli sho'rva, smetana bilan tortiladi."],
      items: [["beef", 400, "g"], ["rice", 150, "g"], ["potato", 2, "pcs"], ["carrot", 1, "pcs"], ["onion", 1, "pcs"], ["tomato", 2, "pcs"], ["sourcream", 100, "g"], ["dill", 1, "bunch"], ["oil", 40, "ml"], ["salt", 2, "tsp"], ["water", 2, "l"]],
      steps: [
        ["Fry the beef cubes in oil, then add the onion, carrot and tomatoes.", "Обжарьте говядину кубиками, затем добавьте лук, морковь и помидоры.", "Mol go'shtini kubik qilib qovuring, keyin piyoz, sabzi va pomidorni qo'shing.", 10],
        ["Pour in the water and cook until the meat is soft.", "Влейте воду и варите, пока мясо не станет мягким.", "Suv quyib, go'sht yumshaguncha pishiring.", 25],
        ["Add the washed rice and potato cubes and cook until the rice is soft.", "Добавьте промытый рис и кубики картофеля, варите до мягкости риса.", "Yuvilgan guruch va kubik kartoshkani solib, guruch yumshaguncha pishiring.", 20],
        ["Serve with a spoon of sour cream and chopped dill.", "Подавайте с ложкой сметаны и рубленым укропом.", "Bir qoshiq smetana va to'g'ralgan shivit bilan torting."],
      ],
    },
    {
      id: "achichuk", cat: "salad", cuisine: "uz", time: 10, level: 1, serves: 4, kcal: 60, veg: true,
      name: ["Achichuk salad", "Салат ачичук", "Achchiq-chuchuk"],
      about: ["Thin tomato and onion slices with salt and pepper: the classic side for plov.",
        "Тонкие ломтики помидоров и лука с солью и перцем: классика к плову.",
        "Tuz va murch sepilgan yupqa pomidor va piyoz: oshning doimiy hamrohi."],
      items: [["tomato", 4, "pcs"], ["onion", 1, "pcs"], ["cilantro", 0.5, "bunch"], ["salt", 1, "tsp"], ["blackpepper", 0.5, "tsp"]],
      steps: [
        ["Slice the onion into very thin half rings, salt them and rinse after a few minutes to take away the sharpness.", "Нарежьте лук тонкими полукольцами, посолите и через несколько минут промойте, чтобы ушла горечь.", "Piyozni juda yupqa yarim halqa qilib to'g'rang, tuzlab, bir necha daqiqadan keyin achchig'i ketishi uchun yuving.", 5],
        ["Slice the tomatoes thinly and mix with the onion.", "Тонко нарежьте помидоры и смешайте с луком.", "Pomidorni yupqa to'g'rab, piyoz bilan aralashtiring."],
        ["Season with salt and pepper and top with cilantro. Serve right away.", "Посолите, поперчите и посыпьте кинзой. Подавайте сразу.", "Tuz va murch seping, ustiga kashnich soling. Darhol torting."],
      ],
    },
    {
      id: "chuchvara", cat: "soup", cuisine: "uz", time: 70, level: 2, serves: 4, kcal: 450, veg: false,
      name: ["Chuchvara", "Чучвара", "Chuchvara"],
      about: ["Small dumplings with minced meat, cooked in broth and served with sour cream.",
        "Маленькие пельмени с фаршем, сваренные в бульоне и поданные со сметаной.",
        "Bulonda pishirilib, smetana bilan tortiladigan mayda qiymali chuchvara."],
      items: [["flour", 300, "g"], ["egg", 1, "pcs"], ["mince", 400, "g"], ["onion", 2, "pcs"], ["sourcream", 100, "g"], ["dill", 0.5, "bunch"], ["salt", 2, "tsp"], ["blackpepper", 0.5, "tsp"], ["water", 2, "l"]],
      steps: [
        ["Make a firm dough from the flour, egg, a little water and salt. Let it rest.", "Замесите плотное тесто из муки, яйца, небольшого количества воды и соли. Дайте отдохнуть.", "Un, tuxum, ozroq suv va tuzdan qattiq xamir qoring. Dam oldiring.", 20],
        ["Mix the mince with finely chopped onion, salt and pepper.", "Смешайте фарш с мелко нарезанным луком, солью и перцем.", "Qiymani mayda to'g'ralgan piyoz, tuz va murch bilan aralashtiring."],
        ["Roll the dough thin, cut small squares, fill them and fold them into little hats.", "Тонко раскатайте тесто, нарежьте небольшие квадраты, наполните и слепите «шапочки».", "Xamirni yupqa yoyib, kichik kvadratlar kesing, qiyma solib, qalpoqcha shaklida yoping."],
        ["Boil the chuchvara in salted water or broth until they float, then a few minutes more.", "Варите чучвару в подсолённой воде или бульоне, пока не всплывёт, и ещё несколько минут.", "Chuchvarani tuzli suv yoki bulonda suv yuziga chiqquncha va yana bir necha daqiqa qaynating.", 8],
        ["Serve with some broth, sour cream and dill.", "Подавайте с бульоном, сметаной и укропом.", "Bulon, smetana va shivit bilan torting."],
      ],
    },
    {
      id: "non", cat: "baking", cuisine: "uz", time: 150, level: 2, serves: 6, kcal: 280, veg: true,
      name: ["Non (Uzbek bread)", "Узбекская лепёшка (нон)", "Obi non"],
      about: ["Round flatbread with a thin, patterned centre and a soft, thick rim.",
        "Круглая лепёшка с тонкой узорной серединой и мягким толстым краем.",
        "O'rtasi yupqa naqshli, cheti qalin va yumshoq dumaloq non."],
      items: [["flour", 600, "g"], ["yeast", 7, "g"], ["sugar", 1, "tsp"], ["milk", 200, "ml"], ["sesame", 1, "tbsp"], ["salt", 1.5, "tsp"], ["water", 200, "ml"]],
      steps: [
        ["Dissolve the yeast and sugar in warm water and milk. Add the flour and salt and knead a soft dough.", "Растворите дрожжи и сахар в тёплой воде с молоком. Добавьте муку и соль и замесите мягкое тесто.", "Xamirturush va shakarni iliq suv va sutda eriting. Un va tuz qo'shib, yumshoq xamir qoring.", 10],
        ["Cover and leave it in a warm place until it doubles.", "Накройте и оставьте в тёплом месте, пока тесто не увеличится вдвое.", "Yopib, ikki barobar ko'tarilguncha iliq joyda qoldiring.", 60],
        ["Shape round breads, press the centre flat and prick a pattern with a fork. Let them rise again.", "Сформируйте круглые лепёшки, придавите середину и наколите узор вилкой. Дайте снова подняться.", "Dumaloq nonlar yasang, o'rtasini bosib yassilang va sanchqi bilan naqsh soling. Yana ko'tarilishiga qo'ying.", 20],
        ["Brush with water, sprinkle with sesame and bake at 230 °C.", "Смажьте водой, посыпьте кунжутом и выпекайте при 230 °C.", "Suv surtib, kunjut seping va 230 °C da pishiring.", 15],
      ],
    },
    {
      id: "dimlama", cat: "main", cuisine: "uz", time: 100, level: 1, serves: 6, kcal: 470, veg: false,
      name: ["Dimlama", "Димлама", "Dimlama"],
      about: ["Meat and vegetables stewed in layers in their own juices, with no water added.",
        "Мясо и овощи, тушённые слоями в собственном соку, без воды.",
        "Qatlam-qatlam terilib, suvsiz, o'z sharbatida dimlangan go'sht va sabzavotlar."],
      items: [["beef", 600, "g"], ["potato", 5, "pcs"], ["cabbage", 0.5, "head"], ["carrot", 2, "pcs"], ["onion", 2, "pcs"], ["tomato", 3, "pcs"], ["pepper", 2, "pcs"], ["garlic", 1, "head"], ["oil", 40, "ml"], ["cumin", 1, "tsp"], ["salt", 2, "tsp"]],
      steps: [
        ["Put a little oil and the beef pieces on the bottom of a heavy pot.", "Налейте немного масла на дно казана и выложите куски говядины.", "Qozon tagiga ozroq yog' quyib, mol go'shti bo'laklarini tering."],
        ["Add layers of onion, carrot, potato, pepper and tomato, seasoning each layer.", "Выкладывайте слоями лук, морковь, картофель, перец и помидоры, приправляя каждый слой.", "Piyoz, sabzi, kartoshka, qalampir va pomidorni qatlam qilib tering, har qatlamni ziravorlang."],
        ["Cover everything with cabbage leaves and put the garlic on top.", "Накройте всё листьями капусты и положите сверху чеснок.", "Hammasini karam barglari bilan yoping va ustiga sarimsoq qo'ying."],
        ["Close the lid tightly and stew on low heat without opening.", "Плотно закройте крышку и тушите на слабом огне, не открывая.", "Qopqoqni zich yopib, ochmasdan past olovda dimlang.", 80],
      ],
    },
    {
      id: "qatlama", cat: "baking", cuisine: "uz", time: 50, level: 2, serves: 4, kcal: 360, veg: true,
      name: ["Qatlama flatbread", "Катлама", "Qatlama"],
      about: ["Crisp, many-layered fried flatbread, great with tea and honey.",
        "Хрустящая многослойная жареная лепёшка, хороша с чаем и мёдом.",
        "Choy va asal bilan juda mos, qarsildoq ko'p qatlamli qovurilgan non."],
      items: [["flour", 400, "g"], ["butter", 80, "g"], ["milk", 100, "ml"], ["salt", 1, "tsp"], ["oil", 100, "ml"], ["water", 120, "ml"]],
      steps: [
        ["Knead a soft dough from the flour, milk, water and salt and let it rest.", "Замесите мягкое тесто из муки, молока, воды и соли и дайте отдохнуть.", "Un, sut, suv va tuzdan yumshoq xamir qorib, dam oldiring.", 15],
        ["Roll it out very thin, spread with soft butter, roll up into a rope and coil it like a snail.", "Очень тонко раскатайте, смажьте мягким маслом, сверните жгутом и закрутите улиткой.", "Juda yupqa yoyib, yumshoq sariyog' surting, arqoncha qilib o'rang va chig'anoq kabi buring."],
        ["Flatten the coils into rounds and fry them in hot oil until golden on both sides.", "Раскатайте улитки в лепёшки и обжарьте в горячем масле с двух сторон до золотистого цвета.", "Chig'anoqlarni yassi qilib yoying va qizigan yog'da ikki tomonini tillarang qilib qovuring.", 6],
      ],
    },
    {
      id: "moshkichiri", cat: "main", cuisine: "uz", time: 70, level: 1, serves: 5, kcal: 430, veg: false,
      name: ["Mung bean rice (moshkichiri)", "Машкичири", "Moshkichiri"],
      about: ["A soft, comforting mix of mung beans, rice and beef, a home-style winter dish.",
        "Мягкое, сытное блюдо из маша, риса и говядины: домашняя зимняя еда.",
        "Mosh, guruch va mol go'shtidan tayyorlanadigan yumshoq, to'yimli uy taomi."],
      items: [["mung", 200, "g"], ["rice", 250, "g"], ["beef", 300, "g"], ["onion", 1, "pcs"], ["carrot", 1, "pcs"], ["oil", 50, "ml"], ["cumin", 1, "tsp"], ["salt", 2, "tsp"], ["water", 1.5, "l"]],
      steps: [
        ["Boil the washed mung beans until they start to split.", "Отварите промытый маш, пока он не начнёт лопаться.", "Yuvilgan moshni yorila boshlaguncha qaynating.", 25],
        ["Meanwhile fry the beef, onion and carrot in oil.", "Тем временем обжарьте говядину, лук и морковь на масле.", "Shu orada mol go'shti, piyoz va sabzini yog'da qovuring.", 10],
        ["Add the fried meat and the rice to the mung beans, season and cook on low heat, stirring now and then, until thick.", "Добавьте обжаренное мясо и рис к машу, приправьте и варите на слабом огне, помешивая, до густоты.", "Qovurilgan go'sht va guruchni moshga qo'shing, ziravorlang va vaqti-vaqti bilan aralashtirib, quyuqlashguncha past olovda pishiring.", 25],
      ],
    },
    {
      id: "shirguruch", cat: "breakfast", cuisine: "uz", time: 40, level: 1, serves: 4, kcal: 330, veg: true,
      name: ["Sweet milk rice (shirguruch)", "Ширгуруч (молочный рис)", "Shirguruch"],
      about: ["Creamy rice porridge cooked in milk, with a piece of butter on top.",
        "Нежная рисовая каша на молоке с кусочком масла сверху.",
        "Sutda pishirilgan, ustiga sariyog' qo'yilgan mayin guruch bo'tqasi."],
      items: [["rice", 200, "g"], ["milk", 1, "l"], ["sugar", 2, "tbsp"], ["butter", 40, "g"], ["salt", 1, "pinch"], ["water", 400, "ml"]],
      steps: [
        ["Boil the washed rice in water until the water is almost gone.", "Отварите промытый рис в воде, пока вода почти не впитается.", "Yuvilgan guruchni suv deyarli qolmaguncha qaynating.", 10],
        ["Add the milk, sugar and a pinch of salt and cook on low heat, stirring, until creamy.", "Добавьте молоко, сахар и щепотку соли и варите на слабом огне, помешивая, до кремовой густоты.", "Sut, shakar va bir chimdim tuz qo'shib, aralashtirib, past olovda quyulguncha pishiring.", 20],
        ["Serve warm with a piece of butter.", "Подавайте тёплой с кусочком сливочного масла.", "Iliq holda bir bo'lak sariyog' bilan torting."],
      ],
    },
    {
      id: "omelette", cat: "breakfast", cuisine: "world", time: 15, level: 1, serves: 2, kcal: 290, veg: true,
      name: ["Tomato omelette", "Омлет с помидорами", "Pomidorli quymoq"],
      about: ["A quick breakfast: soft eggs with fried tomatoes and fresh dill.",
        "Быстрый завтрак: нежные яйца с обжаренными помидорами и свежим укропом.",
        "Tezkor nonushta: qovurilgan pomidor va yangi shivitli yumshoq tuxum."],
      items: [["egg", 4, "pcs"], ["milk", 60, "ml"], ["tomato", 2, "pcs"], ["butter", 20, "g"], ["dill", 0.25, "bunch"], ["salt", 0.5, "tsp"], ["blackpepper", 1, "pinch"]],
      steps: [
        ["Beat the eggs with the milk, salt and pepper.", "Взбейте яйца с молоком, солью и перцем.", "Tuxumni sut, tuz va murch bilan ko'pirtiring."],
        ["Fry the tomato slices in butter for a minute.", "Обжарьте ломтики помидоров на сливочном масле в течение минуты.", "Pomidor bo'laklarini sariyog'da bir daqiqa qovuring.", 2],
        ["Pour in the eggs, cover and cook on low heat until just set. Top with dill.", "Влейте яйца, накройте и готовьте на слабом огне, пока не схватятся. Посыпьте укропом.", "Tuxumni quying, yopib, past olovda qotguncha pishiring. Ustiga shivit seping.", 5],
      ],
    },
    {
      id: "blini", cat: "breakfast", cuisine: "world", time: 40, level: 2, serves: 4, kcal: 310, veg: true,
      name: ["Thin pancakes (blini)", "Блины", "Blinchik"],
      about: ["Thin, soft pancakes to roll up with sour cream, jam or cottage cheese.",
        "Тонкие мягкие блины, которые заворачивают со сметаной, вареньем или творогом.",
        "Smetana, murabbo yoki tvorog bilan o'rab yeyiladigan yupqa, yumshoq blinchiklar."],
      items: [["milk", 500, "ml"], ["egg", 2, "pcs"], ["flour", 200, "g"], ["sugar", 1, "tbsp"], ["oil", 30, "ml"], ["salt", 1, "pinch"]],
      steps: [
        ["Whisk the eggs with the sugar and salt, add half the milk and all the flour and whisk until smooth.", "Взбейте яйца с сахаром и солью, добавьте половину молока и всю муку и размешайте до гладкости.", "Tuxumni shakar va tuz bilan ko'pirtiring, sutning yarmini va hamma unni qo'shib silliq bo'lguncha aralashtiring."],
        ["Stir in the rest of the milk and the oil. Let the batter rest.", "Влейте остальное молоко и масло. Дайте тесту постоять.", "Qolgan sut va yog'ni qo'shing. Xamirni tindiring.", 15],
        ["Pour a thin layer into a hot pan and fry each pancake for about a minute per side.", "Наливайте тонкий слой на горячую сковороду и жарьте каждый блин примерно по минуте с каждой стороны.", "Qizigan tovaga yupqa qatlam quying va har bir blinchikni har tomonidan bir daqiqacha qovuring."],
      ],
    },
    {
      id: "borscht", cat: "soup", cuisine: "world", time: 110, level: 2, serves: 6, kcal: 340, veg: false,
      name: ["Borscht", "Борщ", "Borsh"],
      about: ["A deep red beetroot and cabbage soup with beef, served with sour cream.",
        "Тёмно-красный суп из свёклы и капусты с говядиной, подаётся со сметаной.",
        "Mol go'shtli, lavlagi va karamli to'q qizil sho'rva, smetana bilan tortiladi."],
      items: [["beef", 500, "g"], ["beet", 2, "pcs"], ["cabbage", 0.25, "head"], ["potato", 3, "pcs"], ["carrot", 1, "pcs"], ["onion", 1, "pcs"], ["tomatopaste", 2, "tbsp"], ["garlic", 2, "clove"], ["sourcream", 150, "g"], ["dill", 0.5, "bunch"], ["oil", 30, "ml"], ["salt", 2, "tsp"], ["water", 2.5, "l"]],
      steps: [
        ["Cook the beef in water to make a broth, skimming off the foam.", "Сварите бульон из говядины, снимая пену.", "Mol go'shtidan ko'pigini olib turib bulon qaynating.", 60],
        ["Fry the onion, carrot and grated beetroot in oil, then add the tomato paste.", "Обжарьте лук, морковь и тёртую свёклу на масле, затем добавьте томатную пасту.", "Piyoz, sabzi va qirg'ichdan o'tkazilgan lavlagini yog'da qovuring, keyin tomat pastasini qo'shing.", 10],
        ["Add the potatoes to the broth, then the shredded cabbage.", "Добавьте в бульон картофель, затем нашинкованную капусту.", "Bulonga kartoshka, keyin to'g'ralgan karam soling.", 15],
        ["Add the fried vegetables and garlic and cook a few minutes more. Serve with sour cream and dill.", "Добавьте зажарку и чеснок и варите ещё несколько минут. Подавайте со сметаной и укропом.", "Qovurilgan sabzavot va sarimsoqni qo'shib, yana bir necha daqiqa qaynating. Smetana va shivit bilan torting.", 10],
      ],
    },
    {
      id: "greek", cat: "salad", cuisine: "world", time: 15, level: 1, serves: 3, kcal: 210, veg: true,
      name: ["Greek salad", "Греческий салат", "Grek salati"],
      about: ["Chunky tomatoes, cucumber, pepper and olives with salty cheese and olive oil.",
        "Крупно нарезанные помидоры, огурцы, перец и оливки с солёным сыром и маслом.",
        "Katta to'g'ralgan pomidor, bodring, qalampir va zaytun, sho'r pishloq va yog' bilan."],
      items: [["tomato", 3, "pcs"], ["cucumber", 2, "pcs"], ["pepper", 1, "pcs"], ["onion", 0.5, "pcs"], ["olives", 80, "g"], ["feta", 150, "g"], ["lemon", 0.5, "pcs"], ["oil", 40, "ml"], ["salt", 1, "pinch"]],
      steps: [
        ["Cut the tomatoes, cucumber and pepper into large pieces and the onion into thin rings.", "Нарежьте помидоры, огурцы и перец крупными кусками, а лук тонкими кольцами.", "Pomidor, bodring va qalampirni katta bo'laklarga, piyozni yupqa halqalarga to'g'rang."],
        ["Add the olives and cubes of cheese.", "Добавьте оливки и кубики сыра.", "Zaytun va kubik qilib to'g'ralgan pishloqni qo'shing."],
        ["Dress with oil and lemon juice just before serving.", "Заправьте маслом и лимонным соком прямо перед подачей.", "Tortishdan oldin yog' va limon sharbati bilan aralashtiring."],
      ],
    },
    {
      id: "pasta", cat: "main", cuisine: "world", time: 25, level: 1, serves: 3, kcal: 520, veg: true,
      name: ["Pasta with tomato sauce", "Паста с томатным соусом", "Tomat sousli makaron"],
      about: ["A weekday classic: pasta in a fresh tomato and garlic sauce with grated cheese.",
        "Будничная классика: паста в соусе из свежих помидоров и чеснока с тёртым сыром.",
        "Har kungi klassika: yangi pomidor va sarimsoqli sousdagi makaron, ustiga pishloq."],
      items: [["pasta", 300, "g"], ["tomato", 4, "pcs"], ["garlic", 3, "clove"], ["cheese", 60, "g"], ["parsley", 0.25, "bunch"], ["oil", 30, "ml"], ["salt", 1, "tsp"], ["water", 3, "l"]],
      steps: [
        ["Boil the pasta in plenty of salted water.", "Отварите пасту в большом количестве подсолённой воды.", "Makaronni ko'p tuzli suvda qaynating.", 10],
        ["Meanwhile warm the oil with sliced garlic, add the chopped tomatoes and cook down into a sauce.", "Тем временем прогрейте масло с нарезанным чесноком, добавьте рубленые помидоры и уварите в соус.", "Shu orada yog'ni to'g'ralgan sarimsoq bilan qizdiring, maydalangan pomidorni qo'shib sous bo'lguncha qaynating.", 8],
        ["Mix the drained pasta with the sauce and top with grated cheese and parsley.", "Смешайте откинутую пасту с соусом, посыпьте тёртым сыром и петрушкой.", "Suvi to'kilgan makaronni sous bilan aralashtiring, ustiga pishloq va petrushka seping."],
      ],
    },
    {
      id: "chicken", cat: "main", cuisine: "world", time: 60, level: 1, serves: 4, kcal: 540, veg: false,
      name: ["Baked chicken with potatoes", "Курица с картошкой в духовке", "Duxovkada kartoshkali tovuq"],
      about: ["Chicken pieces and potatoes roasted in one tray with garlic and paprika.",
        "Кусочки курицы и картофель, запечённые на одном противне с чесноком и паприкой.",
        "Bitta patnisda sarimsoq va paprika bilan pishirilgan tovuq bo'laklari va kartoshka."],
      items: [["chicken", 1, "kg"], ["potato", 6, "pcs"], ["garlic", 4, "clove"], ["paprika", 2, "tsp"], ["oil", 50, "ml"], ["salt", 2, "tsp"], ["blackpepper", 1, "tsp"]],
      steps: [
        ["Rub the chicken with garlic, paprika, salt, pepper and oil and leave it for a while.", "Натрите курицу чесноком, паприкой, солью, перцем и маслом и оставьте ненадолго.", "Tovuqni sarimsoq, paprika, tuz, murch va yog' bilan ishqalab, biroz qoldiring.", 15],
        ["Cut the potatoes into wedges and mix with a little oil and salt.", "Нарежьте картофель дольками и смешайте с небольшим количеством масла и соли.", "Kartoshkani bo'lak qilib to'g'rab, ozroq yog' va tuz bilan aralashtiring."],
        ["Put everything in one tray and bake at 200 °C until the chicken is golden and cooked through.", "Выложите всё на противень и запекайте при 200 °C, пока курица не зарумянится и не пропечётся.", "Hammasini bitta patnisga joylab, tovuq qizarib, yaxshi pishguncha 200 °C da pishiring.", 45],
      ],
    },
    {
      id: "syrniki", cat: "breakfast", cuisine: "world", time: 30, level: 1, serves: 3, kcal: 350, veg: true,
      name: ["Cottage cheese pancakes (syrniki)", "Сырники", "Sirniki"],
      about: ["Golden little pancakes made of cottage cheese, served with sour cream or honey.",
        "Золотистые сырники из творога, подаются со сметаной или мёдом.",
        "Tvorogdan tayyorlangan, smetana yoki asal bilan tortiladigan tillarang kulchalar."],
      items: [["tvorog", 400, "g"], ["egg", 1, "pcs"], ["flour", 4, "tbsp"], ["sugar", 2, "tbsp"], ["sourcream", 100, "g"], ["oil", 40, "ml"], ["salt", 1, "pinch"]],
      steps: [
        ["Mash the cottage cheese with the egg, sugar and salt, then mix in the flour.", "Разомните творог с яйцом, сахаром и солью, затем вмешайте муку.", "Tvorogni tuxum, shakar va tuz bilan ezing, keyin un qo'shib aralashtiring."],
        ["Shape small thick rounds and dust them with flour.", "Сформируйте небольшие толстые лепёшки и обваляйте в муке.", "Kichik qalin kulchalar yasab, unga belang."],
        ["Fry on medium heat until golden on both sides. Serve with sour cream.", "Жарьте на среднем огне с двух сторон до золотистого цвета. Подавайте со сметаной.", "O'rtacha olovda ikki tomonini tillarang qilib qovuring. Smetana bilan torting.", 8],
      ],
    },
    {
      id: "sharlotka", cat: "dessert", cuisine: "world", time: 60, level: 1, serves: 8, kcal: 260, veg: true,
      name: ["Apple sponge cake (sharlotka)", "Шарлотка", "Olmali pirog (sharlotka)"],
      about: ["The simplest apple cake: a light sponge baked over plenty of sliced apples.",
        "Самый простой яблочный пирог: лёгкий бисквит, запечённый с большим количеством яблок.",
        "Eng oson olmali pirog: ko'p to'g'ralgan olma ustida pishirilgan yengil biskvit."],
      items: [["apple", 4, "pcs"], ["egg", 4, "pcs"], ["sugar", 200, "g"], ["flour", 180, "g"], ["butter", 15, "g"], ["lemon", 0.5, "pcs"]],
      steps: [
        ["Slice the apples, sprinkle with lemon juice and lay them in a buttered tin.", "Нарежьте яблоки, сбрызните лимонным соком и выложите в смазанную маслом форму.", "Olmani to'g'rab, limon sharbati sepib, sariyog' surtilgan qolipga tering."],
        ["Whisk the eggs with the sugar until thick and pale, then gently fold in the flour.", "Взбейте яйца с сахаром до густой светлой массы, затем аккуратно вмешайте муку.", "Tuxumni shakar bilan oqarib, quyulguncha ko'pirtiring, keyin unni ehtiyotlik bilan aralashtiring.", 7],
        ["Pour the batter over the apples and bake at 180 °C. Don't open the oven for the first 20 minutes.", "Залейте яблоки тестом и выпекайте при 180 °C. Не открывайте духовку первые 20 минут.", "Xamirni olma ustiga quying va 180 °C da pishiring. Dastlabki 20 daqiqa duxovkani ochmang.", 40],
      ],
    },
  ];

  const LANGS = ["en", "ru", "uz"];
  const tri = (arr) => ({ en: arr[0], ru: arr[1], uz: arr[2] });
  const RECIPES = R.map((r) => ({
    ...r,
    name: tri(r.name),
    about: tri(r.about),
    items: r.items.map(([ing, amount, unit]) => ({ ing, amount, unit })),
    steps: r.steps.map((s) => ({ text: tri(s), min: s[3] || 0 })),
  }));

  // Quick checks while developing: every ingredient used must exist.
  RECIPES.forEach((r) => r.items.forEach((it) => {
    if (!INGREDIENTS[it.ing]) console.warn("Unknown ingredient", it.ing, "in", r.id);
  }));

  window.DATA = {
    INGREDIENTS, RECIPES, LANGS,
    CATEGORIES: ["breakfast", "soup", "main", "salad", "baking", "dessert"],
    AISLES: ["produce", "meat", "dairy", "grains", "pantry", "spices"],
    recipe: (id) => RECIPES.find((r) => r.id === id) || null,
  };
})();
