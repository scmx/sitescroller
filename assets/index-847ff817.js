var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var _a;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Layer {
  constructor(image, speedModifier, y) {
    __publicField(this, "image");
    __publicField(this, "speedModifier");
    __publicField(this, "width", 2e3);
    __publicField(this, "height", 1080);
    __publicField(this, "y", 0);
    this.image = image;
    this.speedModifier = speedModifier;
    this.y = y;
  }
  update(view, _deltaTime) {
  }
  draw(view, ctx) {
    const { y } = this;
    const ratio = (this.width - 6) / this.height;
    const width = view.size.height * ratio;
    const imgWidth = canvas.height * ratio;
    const pos = view.resolve({ x: width, y });
    const offset = pos.x * this.speedModifier % imgWidth;
    for (let i = -1; i < 2; i++) {
      const x = offset + i * imgWidth;
      ctx.drawImage(this.image, x, pos.y, imgWidth, canvas.height);
    }
  }
}
const sceneData = [
  [
    [scene1layer1, 0.8, -10],
    [scene1layer2, 1, -10],
    [scene1layer3, 0.8, -9],
    [scene1layer4, 1.1, -6]
  ],
  [
    [scene2layer1, 0.8, -10],
    [scene2layer2, 1, -10],
    [scene2layer3, 0.8, -9],
    [scene2layer4, 1.1, -6]
  ]
];
class Background {
  constructor(scene) {
    __publicField(this, "layers", []);
    this.layers = scene.map(
      ([image, speedModifyer, offset]) => new Layer(image, speedModifyer, offset)
    );
  }
  update(view, deltaTime, _input) {
    for (const layer of this.layers) {
      layer.update(view, deltaTime);
    }
  }
  draw(view, context) {
    for (const layer of this.layers) {
      layer.draw(view, context);
    }
  }
}
const KEYS = {
  up: ["KeyW", "ArrowUp", "Space"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyS", "ArrowRight"],
  down: ["KeyD", "ArrowDown"],
  debug: ["KeyB", "KeyU", "KeyG"]
};
const defaultKeysNone = { up: false, down: false, left: false, right: false };
class InputHandler {
  constructor(view) {
    __publicField(this, "keys", { ...defaultKeysNone });
    __publicField(this, "firstInteraction", false);
    __publicField(this, "view");
    __publicField(this, "xDown", null);
    __publicField(this, "yDown", null);
    __publicField(this, "onKeyDown", (event) => {
      if (KEYS.up.includes(event.code))
        this.keys.up = true;
      else if (KEYS.left.includes(event.code))
        this.keys.left = true;
      else if (KEYS.right.includes(event.code))
        this.keys.right = true;
      else if (KEYS.down.includes(event.code))
        this.keys.down = true;
      else if (KEYS.debug.includes(event.code)) {
        console.log("toggle debug", this.view.debug);
        this.view.debug = !this.view.debug;
        console.log("toggle debug", this.view.debug);
      }
      if (!this.firstInteraction) {
        if (!this.view.debug) {
          console.log(this.view.debug);
          background_music.volume = 0.2;
          background_music.play();
        }
        this.firstInteraction = true;
      }
    });
    __publicField(this, "onKeyUp", (event) => {
      if (KEYS.up.includes(event.code))
        this.keys.up = false;
      else if (KEYS.left.includes(event.code))
        this.keys.left = false;
      else if (KEYS.right.includes(event.code))
        this.keys.right = false;
      else if (KEYS.down.includes(event.code))
        this.keys.down = false;
    });
    __publicField(this, "handleTouchStart", (event) => {
      event.preventDefault();
      const firstTouch = event.touches[0];
      this.xDown = firstTouch.clientX;
      this.yDown = firstTouch.clientY;
    });
    __publicField(this, "handleTouchMove", (event) => {
      if (this.xDown == null || this.yDown == null) {
        return;
      }
      var xUp = event.touches[0].clientX;
      var yUp = event.touches[0].clientY;
      var xDiff = this.xDown - xUp;
      var yDiff = this.yDown - yUp;
      this.keys.left = xDiff > 0;
      this.keys.right = xDiff < 0;
      this.keys.up = yDiff > 5;
      this.keys.down = yDiff < 0;
      this.xDown = event.touches[event.touches.length - 1].clientX;
      this.yDown = event.touches[event.touches.length - 1].clientY;
    });
    __publicField(this, "handleTouchEnd", () => {
      this.keys = { ...defaultKeysNone };
    });
    __publicField(this, "handleBlur", () => {
      this.keys = { ...defaultKeysNone };
    });
    this.view = view;
    addEventListener("keydown", this.onKeyDown);
    addEventListener("keyup", this.onKeyUp);
    addEventListener("touchstart", this.handleTouchStart, { passive: false });
    addEventListener("touchmove", this.handleTouchMove, { passive: false });
    addEventListener("touchend", this.handleTouchEnd, { passive: false });
    addEventListener("blur", this.handleBlur);
  }
}
const pathname$2 = "";
const title$2 = "Sverigeledande på webbaserad bokföring och fakturering | Fortnox";
const items$2 = [
  {
    tagName: "A",
    textContent: "Köp ett lagerbolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Byt till Fortnox",
    pathname: "/byt-till-fortnox"
  },
  {
    tagName: "A",
    textContent: "För redovisningsbyrån",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Bokföringsprogram",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Läs mer om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "Faktureringsprogram",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Löneprogram",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Finansiering",
    pathname: "/finansiering"
  },
  {
    tagName: "A",
    textContent: "Skola & förening",
    pathname: "/paket/skola-forening"
  },
  {
    tagName: "A",
    textContent: "Hitta redovisningsbyrå",
    pathname: "/hitta-redovisningsbyra"
  },
  {
    tagName: "P",
    textContent: "Branschlösningar"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "Support",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "B2B",
    pathname: "/paket/branschlosningar/b2b"
  },
  {
    tagName: "A",
    textContent: "Bemanning och rekrytering",
    pathname: "/paket/branschlosningar/bemanning-rekrytering"
  },
  {
    tagName: "A",
    textContent: "Butik",
    pathname: "/paket/branschlosningar/butik"
  },
  {
    tagName: "A",
    textContent: "Hantverkare",
    pathname: "/paket/branschlosningar/hantverkare"
  },
  {
    tagName: "A",
    textContent: "E-Handel",
    pathname: "/paket/branschlosningar/e-handel"
  },
  {
    tagName: "A",
    textContent: "Fastighetsverksamhet",
    pathname: "/paket/branschlosningar/fastighetsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Juridik",
    pathname: "/paket/branschlosningar/juridik"
  },
  {
    tagName: "A",
    textContent: "Konsult",
    pathname: "/paket/branschlosningar/konsult"
  },
  {
    tagName: "A",
    textContent: "Restaurang",
    pathname: "/paket/branschlosningar/restaurang"
  },
  {
    tagName: "A",
    textContent: "Utbildningsverksamhet",
    pathname: "/paket/branschlosningar/utbildningsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Bokföring",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Fakturering",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Lön",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Utlägg",
    pathname: "/produkt/kvitto-utlagg"
  },
  {
    tagName: "A",
    textContent: "Resa",
    pathname: "/produkt/resa"
  },
  {
    tagName: "A",
    textContent: "Offert & Order",
    pathname: "/produkt/offert-orderprogram"
  },
  {
    tagName: "A",
    textContent: "Tid",
    pathname: "/produkt/fortnox-tid"
  },
  {
    tagName: "A",
    textContent: "Lager",
    pathname: "/produkt/lagerprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Resa",
    pathname: "/produkt/fortnox-kvitto-resa"
  },
  {
    tagName: "A",
    textContent: "Bolagshanteraren",
    pathname: "/produkt/fortnox-bolagshanterare"
  },
  {
    tagName: "A",
    textContent: "Kopplingar",
    pathname: "/kopplingar"
  },
  {
    tagName: "A",
    textContent: "Se alla våra produkter",
    pathname: "/produkt"
  },
  {
    tagName: "A",
    textContent: "Besök kunskapsbanken",
    pathname: "/kunskap"
  },
  {
    tagName: "A",
    textContent: "Företagsguide",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Allt om att starta företag",
    pathname: "/fortnox-foretagsguide/starta-eget-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om att driva företag",
    pathname: "/fortnox-foretagsguide/driva-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om bokföring",
    pathname: "/fortnox-foretagsguide/bokforing"
  },
  {
    tagName: "A",
    textContent: "Se alla guider",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Blogg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Friskvårdsbidrag 2022 - vad gäller?",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/friskvardsbidrag-2022-hur-stort-belopp-och-vad-ingar"
  },
  {
    tagName: "A",
    textContent: "Inkomstskatt, statlig skatt och brytpunkt 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/guide-for-inkomstskatt-2022"
  },
  {
    tagName: "A",
    textContent: "Arbetsgivaravgiften för 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/arbetsgivaravgift-2022-hur-mycket"
  },
  {
    tagName: "A",
    textContent: "Se alla blogginlägg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Ekonomisk Ordlista",
    pathname: "/fortnox-foretagsguide/ekonomisk-ordlista"
  },
  {
    tagName: "A",
    textContent: "Bokföringstips",
    pathname: "/fortnox-foretagsguide/bokforingstips"
  },
  {
    tagName: "A",
    textContent: "Momskalkylator",
    pathname: "/fortnox-foretagsguide/rakna-ut-moms"
  },
  {
    tagName: "A",
    textContent: "Lönekalkylator",
    pathname: "/fortnox-foretagsguide/lon-efter-skatt"
  },
  {
    tagName: "A",
    textContent: "Utbildningar",
    pathname: "/utbildningar"
  },
  {
    tagName: "A",
    textContent: "Fortnox Play",
    pathname: "/play"
  },
  {
    tagName: "A",
    textContent: "Fortnox Magazine",
    pathname: "/magazine"
  },
  {
    tagName: "A",
    textContent: "Varför ska du välja Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "A",
    textContent: "Styrelse & ledning",
    pathname: "/om-fortnox/bolagsstyrning/styrelse-koncernledning"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Aktien",
    pathname: "/om-fortnox/investerare/kursgraf"
  },
  {
    tagName: "A",
    textContent: "Bolagsordning",
    pathname: "/om-fortnox/bolagsstyrning/bolagsordning"
  },
  {
    tagName: "A",
    textContent: "Finansiella rapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter"
  },
  {
    tagName: "A",
    textContent: "Samhällsengagemang",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "A",
    textContent: "Hållbarhetsarbete",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Integritet & säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Partners",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Starta bolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Redovisningsbyrå",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Contact",
    pathname: "/kontakt"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "H1",
    textContent: "Lev din företagsdröm"
  },
  {
    tagName: "P",
    textContent: "Oavsett vad framgång är för dig som företagare, hjälper vi dig att nå dit du vill. Vi har samlat allt du behöver för att starta, växa och utvecklas – på ett ställe."
  },
  {
    tagName: "A",
    textContent: "Börja här",
    pathname: "/framgangsrikt-foretagande-2022"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "P",
    textContent: "Starta bolag med Fortnox"
  },
  {
    tagName: "A",
    textContent: "Fortnox Lagerbolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "P",
    textContent: "Är du nystartad?"
  },
  {
    tagName: "A",
    textContent: "För nystartade",
    pathname: "/paket/nystartad"
  },
  {
    tagName: "P",
    textContent: "Byt till Fortnox"
  },
  {
    tagName: "A",
    textContent: "Byt till Fortnox",
    pathname: "/byt-till-fortnox"
  },
  {
    tagName: "P",
    textContent: "För stora företag"
  },
  {
    tagName: "A",
    textContent: "Hitta rätt lösning",
    pathname: "/paket/affarssystem"
  },
  {
    tagName: "P",
    textContent: "För redovisningsbyrån"
  },
  {
    tagName: "H2",
    textContent: "Vi har allt för byrån – bli Fortnox Byråpartner"
  },
  {
    tagName: "P",
    textContent: "Vi förändrar redovisning och kundsamarbete i grunden och samlar allt som ni och era kunder behöver. Våra smarta produkter och tjänster ger dig full koll på dina kunder, uppdrag och vad som behöver göras."
  },
  {
    tagName: "A",
    textContent: "För din redovisningsbyrå",
    pathname: "/byra"
  },
  {
    tagName: "P",
    textContent: "Våra produkter"
  },
  {
    tagName: "H3",
    textContent: "Produkter och lösningar för olika behov"
  },
  {
    tagName: "A",
    textContent: "Se alla våra produkter",
    pathname: "/produkt"
  },
  {
    tagName: "P",
    textContent: "Bokföringsprogram"
  },
  {
    tagName: "A",
    textContent: "Läs mer och beställ",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "P",
    textContent: "Faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Läs mer och beställ",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "P",
    textContent: "Löneprogram"
  },
  {
    tagName: "A",
    textContent: "Läs mer och beställ",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "P",
    textContent: "Om Fortnox"
  },
  {
    tagName: "H3",
    textContent: "Nyheter"
  },
  {
    tagName: "P",
    textContent: "Det händer mycket på Fortnox. Häng med i vårt nyhetsflöde. Här hittar du pressmeddelanden, debattartiklar, produktnyheter och andra aktualiteter."
  },
  {
    tagName: "A",
    textContent: "Läs mer om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "För Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "P",
    textContent: "Fortnox delar ut pris till Årets Unga Nyföretagare 2022"
  },
  {
    tagName: "A",
    textContent: "Läs hela artikeln",
    pathname: "/om-fortnox/nyhetsrum-media/nyhet/fortnox-delar-ut-pris-till-arets-unga-nyforetagare-2022"
  },
  {
    tagName: "P",
    textContent: "Fortnox integrerar med Skatteverket - bokföring av skattekontot automatiseras"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/4D408F6ED3E07B53"
  },
  {
    tagName: "P",
    textContent: "Fortnox blir Karriärföretag för tredje året i rad"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/527B76FCF45C400B"
  },
  {
    tagName: "P",
    textContent: "Fortnox startar företagsbrevlåda"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/2C20DDD488B63A86"
  },
  {
    tagName: "P",
    textContent: "Kunskapsbanken"
  },
  {
    tagName: "H2",
    textContent: "Fördjupa  dina kunskaper"
  },
  {
    tagName: "P",
    textContent: "Vi har samlat de verktyg som behövs för ett framgångsrikt företagande – på ett ställe. Ta del av värdefull kunskap, inspireras av kundberättelser eller gå en utbildning."
  },
  {
    tagName: "A",
    textContent: "Företagsguide",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Blogg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Utbildningar",
    pathname: "/utbildningar"
  },
  {
    tagName: "A",
    textContent: "Besök vår kunskapsbank",
    pathname: "/kunskap"
  },
  {
    tagName: "P",
    textContent: "Några av våra partners"
  },
  {
    tagName: "A",
    textContent: "Bli partner",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "P",
    textContent: "Vår vision är att skapa ett välmående samhälle format av framgångsrika företag."
  },
  {
    tagName: "A",
    textContent: "Lediga tjänster",
    pathname: "/om-fortnox/karriar/lediga-jobb"
  },
  {
    tagName: "A",
    textContent: "Fortnox Academy",
    pathname: "/om-fortnox/karriar/fortnox-academy"
  },
  {
    tagName: "A",
    textContent: "Fortnoxfolk",
    pathname: "/om-fortnox/karriar/fortnox-folk"
  },
  {
    tagName: "P",
    textContent: "Om Företaget"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Hållbarhet",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Nyheter",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "P",
    textContent: "För utvecklare"
  },
  {
    tagName: "A",
    textContent: "Integrationspartner",
    pathname: "/om-fortnox/partners/integrationspartner"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "För utvecklare",
    pathname: "/"
  },
  {
    tagName: "P",
    textContent: "Support"
  },
  {
    tagName: "A",
    textContent: "Supportportal",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Driftinformation",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Kontakta oss",
    pathname: "/kontakt"
  },
  {
    tagName: "P",
    textContent: "Vår adress"
  },
  {
    tagName: "A",
    textContent: "Se alla våra kontor",
    pathname: "/kontakt/vara-kontor"
  },
  {
    tagName: "P",
    textContent: "Kontakta oss"
  },
  {
    tagName: "P",
    textContent: "0470 - 78 50 00"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/se/app/fortnox/id1350403648"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/store/apps/details"
  },
  {
    tagName: "P",
    textContent: "Följ oss"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/Fortnoxab/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/company/fortnox/mycompany/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/user/FortnoxAB"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "A",
    textContent: "Cookiepolicy",
    pathname: "/om-fortnox/integritet-och-sakerhet/cookies-pa-fortnox-se"
  },
  {
    tagName: "A",
    textContent: "Integritet och säkerhet ",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Avtal & villkor",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor"
  },
  {
    tagName: "P",
    textContent: "Cookie-inställningar"
  }
];
const level1data = {
  pathname: pathname$2,
  title: title$2,
  items: items$2
};
const pathname$1 = "/om-fortnox";
const title$1 = "Navet för företagande | Fortnox";
const items$1 = [
  {
    tagName: "A",
    textContent: "Köp ett lagerbolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Byt till Fortnox",
    pathname: "/byt-till-fortnox"
  },
  {
    tagName: "A",
    textContent: "För redovisningsbyrån",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Bokföringsprogram",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Faktureringsprogram",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Löneprogram",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Finansiering",
    pathname: "/finansiering"
  },
  {
    tagName: "A",
    textContent: "Skola & förening",
    pathname: "/paket/skola-forening"
  },
  {
    tagName: "A",
    textContent: "Hitta redovisningsbyrå",
    pathname: "/hitta-redovisningsbyra"
  },
  {
    tagName: "P",
    textContent: "Branschlösningar"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "Support",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "B2B",
    pathname: "/paket/branschlosningar/b2b"
  },
  {
    tagName: "A",
    textContent: "Bemanning och rekrytering",
    pathname: "/paket/branschlosningar/bemanning-rekrytering"
  },
  {
    tagName: "A",
    textContent: "Butik",
    pathname: "/paket/branschlosningar/butik"
  },
  {
    tagName: "A",
    textContent: "Hantverkare",
    pathname: "/paket/branschlosningar/hantverkare"
  },
  {
    tagName: "A",
    textContent: "E-Handel",
    pathname: "/paket/branschlosningar/e-handel"
  },
  {
    tagName: "A",
    textContent: "Fastighetsverksamhet",
    pathname: "/paket/branschlosningar/fastighetsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Juridik",
    pathname: "/paket/branschlosningar/juridik"
  },
  {
    tagName: "A",
    textContent: "Konsult",
    pathname: "/paket/branschlosningar/konsult"
  },
  {
    tagName: "A",
    textContent: "Restaurang",
    pathname: "/paket/branschlosningar/restaurang"
  },
  {
    tagName: "A",
    textContent: "Utbildningsverksamhet",
    pathname: "/paket/branschlosningar/utbildningsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Bokföring",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Fakturering",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Lön",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Utlägg",
    pathname: "/produkt/kvitto-utlagg"
  },
  {
    tagName: "A",
    textContent: "Resa",
    pathname: "/produkt/resa"
  },
  {
    tagName: "A",
    textContent: "Offert & Order",
    pathname: "/produkt/offert-orderprogram"
  },
  {
    tagName: "A",
    textContent: "Tid",
    pathname: "/produkt/fortnox-tid"
  },
  {
    tagName: "A",
    textContent: "Lager",
    pathname: "/produkt/lagerprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Resa",
    pathname: "/produkt/fortnox-kvitto-resa"
  },
  {
    tagName: "A",
    textContent: "Bolagshanteraren",
    pathname: "/produkt/fortnox-bolagshanterare"
  },
  {
    tagName: "A",
    textContent: "Kopplingar",
    pathname: "/kopplingar"
  },
  {
    tagName: "A",
    textContent: "Se alla våra produkter",
    pathname: "/produkt"
  },
  {
    tagName: "A",
    textContent: "Besök kunskapsbanken",
    pathname: "/kunskap"
  },
  {
    tagName: "A",
    textContent: "Företagsguide",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Allt om att starta företag",
    pathname: "/fortnox-foretagsguide/starta-eget-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om att driva företag",
    pathname: "/fortnox-foretagsguide/driva-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om bokföring",
    pathname: "/fortnox-foretagsguide/bokforing"
  },
  {
    tagName: "A",
    textContent: "Se alla guider",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Blogg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Friskvårdsbidrag 2022 - vad gäller?",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/friskvardsbidrag-2022-hur-stort-belopp-och-vad-ingar"
  },
  {
    tagName: "A",
    textContent: "Inkomstskatt, statlig skatt och brytpunkt 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/guide-for-inkomstskatt-2022"
  },
  {
    tagName: "A",
    textContent: "Arbetsgivaravgiften för 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/arbetsgivaravgift-2022-hur-mycket"
  },
  {
    tagName: "A",
    textContent: "Se alla blogginlägg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Ekonomisk Ordlista",
    pathname: "/fortnox-foretagsguide/ekonomisk-ordlista"
  },
  {
    tagName: "A",
    textContent: "Bokföringstips",
    pathname: "/fortnox-foretagsguide/bokforingstips"
  },
  {
    tagName: "A",
    textContent: "Momskalkylator",
    pathname: "/fortnox-foretagsguide/rakna-ut-moms"
  },
  {
    tagName: "A",
    textContent: "Lönekalkylator",
    pathname: "/fortnox-foretagsguide/lon-efter-skatt"
  },
  {
    tagName: "A",
    textContent: "Utbildningar",
    pathname: "/utbildningar"
  },
  {
    tagName: "A",
    textContent: "Fortnox Play",
    pathname: "/play"
  },
  {
    tagName: "A",
    textContent: "Fortnox Magazine",
    pathname: "/magazine"
  },
  {
    tagName: "A",
    textContent: "Läs mer om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "Varför ska du välja Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "A",
    textContent: "Styrelse & ledning",
    pathname: "/om-fortnox/bolagsstyrning/styrelse-koncernledning"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Aktien",
    pathname: "/om-fortnox/investerare/kursgraf"
  },
  {
    tagName: "A",
    textContent: "Bolagsordning",
    pathname: "/om-fortnox/bolagsstyrning/bolagsordning"
  },
  {
    tagName: "A",
    textContent: "Finansiella rapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter"
  },
  {
    tagName: "A",
    textContent: "Samhällsengagemang",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "A",
    textContent: "Hållbarhetsarbete",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Integritet & säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Partners",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Starta bolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Redovisningsbyrå",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Contact",
    pathname: "/kontakt"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/"
  },
  {
    tagName: "P",
    textContent: "Om Fortnox"
  },
  {
    tagName: "A",
    textContent: "Om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "Varför ska du välja Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Vår historia",
    pathname: "/om-fortnox/historia"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Finansiella rapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter"
  },
  {
    tagName: "A",
    textContent: "Delårsrapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter/delarsrapporter"
  },
  {
    tagName: "A",
    textContent: "Årsredovisning",
    pathname: "/om-fortnox/investerare/finansiella-rapporter/arsredovisning"
  },
  {
    tagName: "A",
    textContent: "Aktien",
    pathname: "/om-fortnox/investerare/kursgraf"
  },
  {
    tagName: "A",
    textContent: "Insynshandel",
    pathname: "/om-fortnox/investerare/insynshandel"
  },
  {
    tagName: "A",
    textContent: "Ägarstruktur",
    pathname: "/om-fortnox/investerare/agarstruktur"
  },
  {
    tagName: "A",
    textContent: "Aktiekapitalets utveckling",
    pathname: "/om-fortnox/investerare/aktiekapitaletsutveckling"
  },
  {
    tagName: "A",
    textContent: "Prospekt",
    pathname: "/om-fortnox/investerare/prospekt"
  },
  {
    tagName: "A",
    textContent: "Bolagsstyrning",
    pathname: "/om-fortnox/bolagsstyrning"
  },
  {
    tagName: "A",
    textContent: "Bolagsordning",
    pathname: "/om-fortnox/bolagsstyrning/bolagsordning"
  },
  {
    tagName: "A",
    textContent: "Bolagsstämma",
    pathname: "/om-fortnox/bolagsstyrning/bolagsstamma"
  },
  {
    tagName: "A",
    textContent: "Styrelse och koncernledning",
    pathname: "/om-fortnox/bolagsstyrning/styrelse-koncernledning"
  },
  {
    tagName: "A",
    textContent: "Valberedning och revisor",
    pathname: "/om-fortnox/bolagsstyrning/valberedning-revisor"
  },
  {
    tagName: "A",
    textContent: "Policies",
    pathname: "/om-fortnox/bolagsstyrning/policies"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "A",
    textContent: "Presskontakt",
    pathname: "/om-fortnox/investerare/presskontakt"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Lediga tjänster",
    pathname: "/om-fortnox/karriar/lediga-jobb"
  },
  {
    tagName: "A",
    textContent: "Employer Value Proposition",
    pathname: "/om-fortnox/karriar/fler-foerdelar-med-fortnox"
  },
  {
    tagName: "A",
    textContent: "Fortnox Folk",
    pathname: "/om-fortnox/karriar/fortnox-folk"
  },
  {
    tagName: "A",
    textContent: "Fortnox Academy",
    pathname: "/om-fortnox/karriar/fortnox-academy"
  },
  {
    tagName: "A",
    textContent: "Redefine",
    pathname: "/redefine"
  },
  {
    tagName: "A",
    textContent: "Hållbarhetsarbete",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Klimatpåverkan",
    pathname: "/om-fortnox/klimatpaverkan"
  },
  {
    tagName: "A",
    textContent: "Samhällsengagemang",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "A",
    textContent: "Partners",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "A",
    textContent: "Integritet och säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "GDPR",
    pathname: "/om-fortnox/integritet-och-sakerhet/gdpr"
  },
  {
    tagName: "A",
    textContent: "Säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet/sakerhet"
  },
  {
    tagName: "A",
    textContent: "Cookies",
    pathname: "/om-fortnox/integritet-och-sakerhet/cookies-pa-fortnox-se"
  },
  {
    tagName: "A",
    textContent: "Incidenthantering",
    pathname: "/om-fortnox/integritet-och-sakerhet/incidenthantering"
  },
  {
    tagName: "A",
    textContent: "Avtal och villkor",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande Fortnox Finans",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande-fortnox-finans"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjansteavtal"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal- Finansiella tjänster",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjansteavtal-finansiella-tjanster"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal- Byråpartner",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjaensteavtal-byrapartner"
  },
  {
    tagName: "A",
    textContent: "Klagomål Fortnox Finans",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/klagomal-fortnox-finans"
  },
  {
    tagName: "A",
    textContent: "Bug Bounty",
    pathname: "/om-fortnox/integritet-och-sakerhet/bug-bounty"
  },
  {
    tagName: "P",
    textContent: "Välkommen till Om Fortnox"
  },
  {
    tagName: "A",
    textContent: "Om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "Varför ska du välja Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Vår historia",
    pathname: "/om-fortnox/historia"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Finansiella rapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter"
  },
  {
    tagName: "A",
    textContent: "Delårsrapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter/delarsrapporter"
  },
  {
    tagName: "A",
    textContent: "Årsredovisning",
    pathname: "/om-fortnox/investerare/finansiella-rapporter/arsredovisning"
  },
  {
    tagName: "A",
    textContent: "Aktien",
    pathname: "/om-fortnox/investerare/kursgraf"
  },
  {
    tagName: "A",
    textContent: "Insynshandel",
    pathname: "/om-fortnox/investerare/insynshandel"
  },
  {
    tagName: "A",
    textContent: "Ägarstruktur",
    pathname: "/om-fortnox/investerare/agarstruktur"
  },
  {
    tagName: "A",
    textContent: "Aktiekapitalets utveckling",
    pathname: "/om-fortnox/investerare/aktiekapitaletsutveckling"
  },
  {
    tagName: "A",
    textContent: "Prospekt",
    pathname: "/om-fortnox/investerare/prospekt"
  },
  {
    tagName: "A",
    textContent: "Bolagsstyrning",
    pathname: "/om-fortnox/bolagsstyrning"
  },
  {
    tagName: "A",
    textContent: "Bolagsordning",
    pathname: "/om-fortnox/bolagsstyrning/bolagsordning"
  },
  {
    tagName: "A",
    textContent: "Bolagsstämma",
    pathname: "/om-fortnox/bolagsstyrning/bolagsstamma"
  },
  {
    tagName: "A",
    textContent: "Styrelse och koncernledning",
    pathname: "/om-fortnox/bolagsstyrning/styrelse-koncernledning"
  },
  {
    tagName: "A",
    textContent: "Valberedning och revisor",
    pathname: "/om-fortnox/bolagsstyrning/valberedning-revisor"
  },
  {
    tagName: "A",
    textContent: "Policies",
    pathname: "/om-fortnox/bolagsstyrning/policies"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "A",
    textContent: "Presskontakt",
    pathname: "/om-fortnox/investerare/presskontakt"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Lediga tjänster",
    pathname: "/om-fortnox/karriar/lediga-jobb"
  },
  {
    tagName: "A",
    textContent: "Employer Value Proposition",
    pathname: "/om-fortnox/karriar/fler-foerdelar-med-fortnox"
  },
  {
    tagName: "A",
    textContent: "Fortnox Folk",
    pathname: "/om-fortnox/karriar/fortnox-folk"
  },
  {
    tagName: "A",
    textContent: "Fortnox Academy",
    pathname: "/om-fortnox/karriar/fortnox-academy"
  },
  {
    tagName: "A",
    textContent: "Redefine",
    pathname: "/redefine"
  },
  {
    tagName: "A",
    textContent: "Hållbarhetsarbete",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Klimatpåverkan",
    pathname: "/om-fortnox/klimatpaverkan"
  },
  {
    tagName: "A",
    textContent: "Samhällsengagemang",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "A",
    textContent: "Partners",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "A",
    textContent: "Integritet och säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "GDPR",
    pathname: "/om-fortnox/integritet-och-sakerhet/gdpr"
  },
  {
    tagName: "A",
    textContent: "Säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet/sakerhet"
  },
  {
    tagName: "A",
    textContent: "Cookies",
    pathname: "/om-fortnox/integritet-och-sakerhet/cookies-pa-fortnox-se"
  },
  {
    tagName: "A",
    textContent: "Incidenthantering",
    pathname: "/om-fortnox/integritet-och-sakerhet/incidenthantering"
  },
  {
    tagName: "A",
    textContent: "Avtal och villkor",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande Fortnox Finans",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande-fortnox-finans"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjansteavtal"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal- Finansiella tjänster",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjansteavtal-finansiella-tjanster"
  },
  {
    tagName: "A",
    textContent: "Tjänsteavtal- Byråpartner",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/tjaensteavtal-byrapartner"
  },
  {
    tagName: "A",
    textContent: "Klagomål Fortnox Finans",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/klagomal-fortnox-finans"
  },
  {
    tagName: "A",
    textContent: "Bug Bounty",
    pathname: "/om-fortnox/integritet-och-sakerhet/bug-bounty"
  },
  {
    tagName: "P",
    textContent: "Om Fortnox"
  },
  {
    tagName: "H1",
    textContent: "Vi är navet för företagande"
  },
  {
    tagName: "P",
    textContent: "Vi är en företagsplattform som knyter samman människor, företag och organisationer. Genom detta vill vi bidra till ett välmående samhälle format av framgångsrika företag."
  },
  {
    tagName: "A",
    textContent: "Lär mer om Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Jobba på Fortnox",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "P",
    textContent: "Vi är Fortnox"
  },
  {
    tagName: "H2",
    textContent: "Utan drömmen  stannar Sverige"
  },
  {
    tagName: "P",
    textContent: "Oavsett vad din företagsdröm är, så kan vi gå bredvid. Vårt jobb är att lösa allt det som håller dig tillbaka. Så du kan sätta planer i verket och lättare nå dina mål och din egen version av framgång. Varför inte börja redan idag?"
  },
  {
    tagName: "A",
    textContent: "Läs mer om Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "P",
    textContent: "Karriär"
  },
  {
    tagName: "H2",
    textContent: "Vill du vara med och revolutionera en hel bransch?"
  },
  {
    tagName: "P",
    textContent: "Att vara en del av Fortnox är att vara en del av en ständig förändring - en förändring där du själv bestämmer hur långt du vill nå. Vårt största fokus är att ge dig rätt förutsättningar att få leva din passion tillsammans med oss."
  },
  {
    tagName: "A",
    textContent: "Bli en del av Fortnox",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "P",
    textContent: "Nyhetsrum & media"
  },
  {
    tagName: "H2",
    textContent: "Vad händer på Fortnox"
  },
  {
    tagName: "P",
    textContent: "Ta del av det senaste som händer hos oss! Här hittar du  alla våra pressmeddelanden, koncerna nyheter och debattinlägg. Du kan även prenumerera på våra utskick för att vara säker på att du inte missar något."
  },
  {
    tagName: "A",
    textContent: "Se alla våra nyheter",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "P",
    textContent: "Nyhetsrummet"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/527B76FCF45C400B"
  },
  {
    tagName: "P",
    textContent: "Ökad organisk tillväxt och värdefulla produktnyheter"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/00F610E19B9DEFE5"
  },
  {
    tagName: "P",
    textContent: "“Vi kommer vara att räkna med”"
  },
  {
    tagName: "A",
    textContent: "Läs hela artikeln ",
    pathname: "/om-fortnox/nyhetsrum-media/nyhet/vi-kommer-vara-att-rakna-med"
  },
  {
    tagName: "P",
    textContent: "Kommuniké från extra bolagsstämma i Fortnox AB (publ)"
  },
  {
    tagName: "A",
    textContent: "här",
    pathname: "/om-fortnox/bolagsstyrning/bolagsstamma"
  },
  {
    tagName: "A",
    textContent: "Läs hela pressmeddelandet",
    pathname: "/om-fortnox/nyhetsrum-media/pressrelease/685481AEC8F9D1DD"
  },
  {
    tagName: "P",
    textContent: "Investerare"
  },
  {
    tagName: "A",
    textContent: "Läs mer",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "P",
    textContent: "Bolagsstyrning"
  },
  {
    tagName: "A",
    textContent: "Läs mer",
    pathname: "/om-fortnox/bolagsstyrning"
  },
  {
    tagName: "P",
    textContent: "Samhällsengagemang"
  },
  {
    tagName: "A",
    textContent: "Läs mer",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "P",
    textContent: "Vår vision är att skapa ett välmående samhälle format av framgångsrika företag."
  },
  {
    tagName: "A",
    textContent: "Lediga tjänster",
    pathname: "/om-fortnox/karriar/lediga-jobb"
  },
  {
    tagName: "A",
    textContent: "Fortnox Academy",
    pathname: "/om-fortnox/karriar/fortnox-academy"
  },
  {
    tagName: "A",
    textContent: "Fortnoxfolk",
    pathname: "/om-fortnox/karriar/fortnox-folk"
  },
  {
    tagName: "P",
    textContent: "Om Företaget"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Hållbarhet",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Nyheter",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "P",
    textContent: "För utvecklare"
  },
  {
    tagName: "A",
    textContent: "Integrationspartner",
    pathname: "/om-fortnox/partners/integrationspartner"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "För utvecklare",
    pathname: "/"
  },
  {
    tagName: "P",
    textContent: "Support"
  },
  {
    tagName: "A",
    textContent: "Supportportal",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Driftinformation",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Kontakta oss",
    pathname: "/kontakt"
  },
  {
    tagName: "P",
    textContent: "Vår adress"
  },
  {
    tagName: "A",
    textContent: "Se alla våra kontor",
    pathname: "/kontakt/vara-kontor"
  },
  {
    tagName: "P",
    textContent: "Kontakta oss"
  },
  {
    tagName: "P",
    textContent: "0470 - 78 50 00"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/se/app/fortnox/id1350403648"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/store/apps/details"
  },
  {
    tagName: "P",
    textContent: "Följ oss"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/Fortnoxab/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/company/fortnox/mycompany/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/user/FortnoxAB"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "A",
    textContent: "Cookiepolicy",
    pathname: "/om-fortnox/integritet-och-sakerhet/cookies-pa-fortnox-se"
  },
  {
    tagName: "A",
    textContent: "Integritet och säkerhet ",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Avtal & villkor",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor"
  },
  {
    tagName: "P",
    textContent: "Cookie-inställningar"
  }
];
const level2data = {
  pathname: pathname$1,
  title: title$1,
  items: items$1
};
const pathname = "/paket";
const title = "Allt för ditt företag – paket för olika behov | Fortnox";
const items = [
  {
    tagName: "A",
    textContent: "Köp ett lagerbolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Byt till Fortnox",
    pathname: "/byt-till-fortnox"
  },
  {
    tagName: "A",
    textContent: "För redovisningsbyrån",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Bokföringsprogram",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Faktureringsprogram",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Löneprogram",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Finansiering",
    pathname: "/finansiering"
  },
  {
    tagName: "A",
    textContent: "Skola & förening",
    pathname: "/paket/skola-forening"
  },
  {
    tagName: "A",
    textContent: "Hitta redovisningsbyrå",
    pathname: "/hitta-redovisningsbyra"
  },
  {
    tagName: "P",
    textContent: "Branschlösningar"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "Support",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "B2B",
    pathname: "/paket/branschlosningar/b2b"
  },
  {
    tagName: "A",
    textContent: "Bemanning och rekrytering",
    pathname: "/paket/branschlosningar/bemanning-rekrytering"
  },
  {
    tagName: "A",
    textContent: "Butik",
    pathname: "/paket/branschlosningar/butik"
  },
  {
    tagName: "A",
    textContent: "Hantverkare",
    pathname: "/paket/branschlosningar/hantverkare"
  },
  {
    tagName: "A",
    textContent: "E-Handel",
    pathname: "/paket/branschlosningar/e-handel"
  },
  {
    tagName: "A",
    textContent: "Fastighetsverksamhet",
    pathname: "/paket/branschlosningar/fastighetsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Juridik",
    pathname: "/paket/branschlosningar/juridik"
  },
  {
    tagName: "A",
    textContent: "Konsult",
    pathname: "/paket/branschlosningar/konsult"
  },
  {
    tagName: "A",
    textContent: "Restaurang",
    pathname: "/paket/branschlosningar/restaurang"
  },
  {
    tagName: "A",
    textContent: "Utbildningsverksamhet",
    pathname: "/paket/branschlosningar/utbildningsverksamhet"
  },
  {
    tagName: "A",
    textContent: "Bokföring",
    pathname: "/produkt/bokforingsprogram"
  },
  {
    tagName: "A",
    textContent: "Fakturering",
    pathname: "/produkt/faktureringsprogram"
  },
  {
    tagName: "A",
    textContent: "Lön",
    pathname: "/produkt/loneprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Utlägg",
    pathname: "/produkt/kvitto-utlagg"
  },
  {
    tagName: "A",
    textContent: "Resa",
    pathname: "/produkt/resa"
  },
  {
    tagName: "A",
    textContent: "Offert & Order",
    pathname: "/produkt/offert-orderprogram"
  },
  {
    tagName: "A",
    textContent: "Tid",
    pathname: "/produkt/fortnox-tid"
  },
  {
    tagName: "A",
    textContent: "Lager",
    pathname: "/produkt/lagerprogram"
  },
  {
    tagName: "A",
    textContent: "Kvitto & Resa",
    pathname: "/produkt/fortnox-kvitto-resa"
  },
  {
    tagName: "A",
    textContent: "Bolagshanteraren",
    pathname: "/produkt/fortnox-bolagshanterare"
  },
  {
    tagName: "A",
    textContent: "Kopplingar",
    pathname: "/kopplingar"
  },
  {
    tagName: "A",
    textContent: "Se alla våra produkter",
    pathname: "/produkt"
  },
  {
    tagName: "A",
    textContent: "Besök kunskapsbanken",
    pathname: "/kunskap"
  },
  {
    tagName: "A",
    textContent: "Företagsguide",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Allt om att starta företag",
    pathname: "/fortnox-foretagsguide/starta-eget-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om att driva företag",
    pathname: "/fortnox-foretagsguide/driva-foretag"
  },
  {
    tagName: "A",
    textContent: "Allt om bokföring",
    pathname: "/fortnox-foretagsguide/bokforing"
  },
  {
    tagName: "A",
    textContent: "Se alla guider",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "A",
    textContent: "Blogg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Friskvårdsbidrag 2022 - vad gäller?",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/friskvardsbidrag-2022-hur-stort-belopp-och-vad-ingar"
  },
  {
    tagName: "A",
    textContent: "Inkomstskatt, statlig skatt och brytpunkt 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/guide-for-inkomstskatt-2022"
  },
  {
    tagName: "A",
    textContent: "Arbetsgivaravgiften för 2022",
    pathname: "/fortnox-foretagsguide/lon-och-loneadministration/arbetsgivaravgift-2022-hur-mycket"
  },
  {
    tagName: "A",
    textContent: "Se alla blogginlägg",
    pathname: "/blogg"
  },
  {
    tagName: "A",
    textContent: "Ekonomisk Ordlista",
    pathname: "/fortnox-foretagsguide/ekonomisk-ordlista"
  },
  {
    tagName: "A",
    textContent: "Bokföringstips",
    pathname: "/fortnox-foretagsguide/bokforingstips"
  },
  {
    tagName: "A",
    textContent: "Momskalkylator",
    pathname: "/fortnox-foretagsguide/rakna-ut-moms"
  },
  {
    tagName: "A",
    textContent: "Lönekalkylator",
    pathname: "/fortnox-foretagsguide/lon-efter-skatt"
  },
  {
    tagName: "A",
    textContent: "Utbildningar",
    pathname: "/utbildningar"
  },
  {
    tagName: "A",
    textContent: "Fortnox Play",
    pathname: "/play"
  },
  {
    tagName: "A",
    textContent: "Fortnox Magazine",
    pathname: "/magazine"
  },
  {
    tagName: "A",
    textContent: "Läs mer om Fortnox",
    pathname: "/om-fortnox"
  },
  {
    tagName: "A",
    textContent: "Varför ska du välja Fortnox",
    pathname: "/om-fortnox/varfor"
  },
  {
    tagName: "A",
    textContent: "Karriär",
    pathname: "/om-fortnox/karriar"
  },
  {
    tagName: "A",
    textContent: "Nyhetsrum",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "A",
    textContent: "Styrelse & ledning",
    pathname: "/om-fortnox/bolagsstyrning/styrelse-koncernledning"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Aktien",
    pathname: "/om-fortnox/investerare/kursgraf"
  },
  {
    tagName: "A",
    textContent: "Bolagsordning",
    pathname: "/om-fortnox/bolagsstyrning/bolagsordning"
  },
  {
    tagName: "A",
    textContent: "Finansiella rapporter",
    pathname: "/om-fortnox/investerare/finansiella-rapporter"
  },
  {
    tagName: "A",
    textContent: "Samhällsengagemang",
    pathname: "/om-fortnox/csr-samhallsengagemang"
  },
  {
    tagName: "A",
    textContent: "Hållbarhetsarbete",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Integritet & säkerhet",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Partners",
    pathname: "/om-fortnox/partners"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Starta bolag",
    pathname: "/lagerbolag"
  },
  {
    tagName: "A",
    textContent: "Beställ paket",
    pathname: "/paket"
  },
  {
    tagName: "A",
    textContent: "Redovisningsbyrå",
    pathname: "/byra"
  },
  {
    tagName: "A",
    textContent: "Contact",
    pathname: "/kontakt"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "Log in",
    pathname: "/fs/fs/login.php"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/"
  },
  {
    tagName: "P",
    textContent: "Paket"
  },
  {
    tagName: "H1",
    textContent: "Paketlösningar för ett framgångsrikt företagande"
  },
  {
    tagName: "P",
    textContent: "Kom igång med Fortnox företagsplattform. Helt molnbaserat, alltid fri support."
  },
  {
    tagName: "A",
    textContent: "Jämför paketen",
    pathname: "/paket"
  },
  {
    tagName: "P",
    textContent: "Översikt"
  },
  {
    tagName: "H2",
    textContent: "Vi har allt för ditt företag – på ett ställe"
  },
  {
    tagName: "P",
    textContent: "Vår plattform är full med smarta lösningar som automatiserar och underlättar ditt företagande – oavsett vad du har för behov."
  },
  {
    tagName: "A",
    textContent: "Få hjälp med att välja paket",
    pathname: "/paket"
  },
  {
    tagName: "P",
    textContent: "Koppling till Sveriges samtliga största banker"
  },
  {
    tagName: "H2",
    textContent: "Smart bokföring som ger dig kontroll"
  },
  {
    tagName: "P",
    textContent: "Hantera kvitton och leverantörsfakturor digitalt, och få automatiska förslag på hur de ska bokföras. Med kopplingar till Skatteverket och Sveriges samtliga största banker sköter du dina betalningar direkt från programmet – och kan dessutom få majoriteten av dina transaktioner på bank- och skattekontot bokförda helt automatiskt."
  },
  {
    tagName: "H2",
    textContent: "Ta betalt var och när du vill"
  },
  {
    tagName: "P",
    textContent: "Ta betalt av dina kunder med ett par klick i mobilen eller på en dator. Dina fakturor skickas helt digitalt via e-post eller e-faktura. När du får betalt matchas och bokförs betalningen mot rätt faktura – helt automatiskt. Fakturerar du med rot-, rut- eller grönt avdrag? Då rapporterar du smidigt till Skatteverket via smart filuppladdning."
  },
  {
    tagName: "H2",
    textContent: "Komplett och enkel lönehantering"
  },
  {
    tagName: "P",
    textContent: "Alltid uppdaterat med aktuella skattetabeller, lagar och regler – så att du enkelt kan ta hand om lönerna själv. Automatisk överföring till Skatteverket underlättar arbetsgivardeklarationer på individnivå, och de anställda kan själva rapportera när- och frånvaro och få sina lönebesked i Fortnox App. Bokföringen får du med automatik."
  },
  {
    tagName: "H2",
    textContent: "Spara tid och  minska risken för fel"
  },
  {
    tagName: "P",
    textContent: "Integrationslicensen ingår i alla våra paket, och gör det möjligt att koppla ihop ditt Fortnox med andra system som du använder i din verksamhet – exempelvis ditt kassasystem, arbetsordersystem eller din webbshop. Du sparar tid, slipper dubbelarbete och minimerar risken för fel."
  },
  {
    tagName: "A",
    textContent: "Sök bland våra integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "P",
    textContent: "Över 400 integrationer – här är några av dem"
  },
  {
    tagName: "H2",
    textContent: "Helt automatiserad  kvittohantering"
  },
  {
    tagName: "P",
    textContent: "Kvitto & Utlägg underlättar och automatiserar för alla inblandade – från användaren som fotar kvittot, till den som stämmer av bokföringen eller hanterar lönerna. Ett tidssparande kvittoflöde utan dubbelarbete, helt enkelt! Används tillsammans med Bokföring och/eller Lön. 4.90 kronor per tolkat kvitto."
  },
  {
    tagName: "H2",
    textContent: "Rapportera dina tjänsteresor i farten"
  },
  {
    tagName: "P",
    textContent: "Med Resa är det enklare är någonsin för dig och företagets anställda att hantera tjänsteresor. All rapportering sker i Fortnox App, och omvandlas till löneunderlag med ett klick. Fungerar för både inrikes och utrikes resor – och självklart får du hjälp med att hålla koll på regelverk och belopp. 4.90 kronor per registrerad resa."
  },
  {
    tagName: "H2",
    textContent: "Vilka funktioner behöver du?"
  },
  {
    tagName: "P",
    textContent: "Fortnox Bas"
  },
  {
    tagName: "A",
    textContent: "Beställ",
    pathname: "/checkout/package/1007"
  },
  {
    tagName: "A",
    textContent: "Beställ",
    pathname: "/checkout/package/1008"
  },
  {
    tagName: "A",
    textContent: "Beställ",
    pathname: "/checkout/package/1009"
  },
  {
    tagName: "P",
    textContent: "Vi sparar mycket tid tack vare effektivare flöden och bättre säkerhet."
  },
  {
    tagName: "A",
    textContent: "Till erbjudandet",
    pathname: "/paket/nystartad"
  },
  {
    tagName: "P",
    textContent: "Om du har ett annat system idag"
  },
  {
    tagName: "A",
    textContent: "Så här går ett byte till",
    pathname: "/byt-till-fortnox/sa-gar-bytet-till"
  },
  {
    tagName: "P",
    textContent: "Fler produkter för olika behov"
  },
  {
    tagName: "A",
    textContent: "Se alla våra produkter",
    pathname: "/produkt"
  },
  {
    tagName: "P",
    textContent: "Få en hjälpande hand"
  },
  {
    tagName: "A",
    textContent: "Hitta en redovisningsbyrå",
    pathname: "/hitta-redovisningsbyra"
  },
  {
    tagName: "P",
    textContent: "Kom i kontakt med oss"
  },
  {
    tagName: "H2",
    textContent: "Vill du veta mer om Fortnox paketlösningar?"
  },
  {
    tagName: "P",
    textContent: "Fyll i dina uppgifter nedan så kontaktar vi dig så snart som möjligt."
  },
  {
    tagName: "A",
    textContent: "Fortnox's Privacy Notice",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "P",
    textContent: "Send"
  },
  {
    tagName: "H2",
    textContent: "Allt om företagande"
  },
  {
    tagName: "P",
    textContent: "Att vara egenföretagare ska vara enkelt. I Fortnox Företagsguide hjälper vi dig med allt som har med företagande att göra – allt från att starta och driva, till mer detaljerad information om bokföring, lön samt skatter och moms."
  },
  {
    tagName: "A",
    textContent: "Till Företagsguiden",
    pathname: "/fortnox-foretagsguide"
  },
  {
    tagName: "H2",
    textContent: "Kontakta oss"
  },
  {
    tagName: "P",
    textContent: "0470 - 78 50 00"
  },
  {
    tagName: "P",
    textContent: "info@fortnox.se"
  },
  {
    tagName: "H2",
    textContent: "FAQ"
  },
  {
    tagName: "P",
    textContent: "Har du några frågor? Här besvarar vi några av de vanligaste funderingarna kring hur det fungerar att komma igång med Fortnox. Hittar du inte svar på det du söker? Kontakta oss så hjälper vi dig vidare."
  },
  {
    tagName: "A",
    textContent: "Bolagshanteraren ›",
    pathname: "/produkt/fortnox-bolagshanterare"
  },
  {
    tagName: "P",
    textContent: "Kan även större företag använda Fortnox?"
  },
  {
    tagName: "A",
    textContent: "Lösningar för större företag ›",
    pathname: "/paket/affarssystem"
  },
  {
    tagName: "P",
    textContent: "Hur kommer jag igång med programmet?"
  },
  {
    tagName: "A",
    textContent: "Läs mer om våra utbildningar",
    pathname: "/utbildningar"
  },
  {
    tagName: "P",
    textContent: "Kan jag få hjälp av en redovisningsbyrå?"
  },
  {
    tagName: "A",
    textContent: "Hitta en redovisningsbyrå som använder Fortnox ›",
    pathname: "/hitta-redovisningsbyra"
  },
  {
    tagName: "P",
    textContent: "Vår vision är att skapa ett välmående samhälle format av framgångsrika företag."
  },
  {
    tagName: "A",
    textContent: "Lediga tjänster",
    pathname: "/om-fortnox/karriar/lediga-jobb"
  },
  {
    tagName: "A",
    textContent: "Fortnox Academy",
    pathname: "/om-fortnox/karriar/fortnox-academy"
  },
  {
    tagName: "A",
    textContent: "Fortnoxfolk",
    pathname: "/om-fortnox/karriar/fortnox-folk"
  },
  {
    tagName: "P",
    textContent: "Om Företaget"
  },
  {
    tagName: "A",
    textContent: "Investerare",
    pathname: "/om-fortnox/investerare"
  },
  {
    tagName: "A",
    textContent: "Hållbarhet",
    pathname: "/om-fortnox/hallbarhet"
  },
  {
    tagName: "A",
    textContent: "Nyheter",
    pathname: "/om-fortnox/nyhetsrum-media"
  },
  {
    tagName: "P",
    textContent: "För utvecklare"
  },
  {
    tagName: "A",
    textContent: "Integrationspartner",
    pathname: "/om-fortnox/partners/integrationspartner"
  },
  {
    tagName: "A",
    textContent: "Integrationer",
    pathname: "/integrationer"
  },
  {
    tagName: "A",
    textContent: "För utvecklare",
    pathname: "/"
  },
  {
    tagName: "P",
    textContent: "Support"
  },
  {
    tagName: "A",
    textContent: "Supportportal",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Driftinformation",
    pathname: "/"
  },
  {
    tagName: "A",
    textContent: "Kontakta oss",
    pathname: "/kontakt"
  },
  {
    tagName: "P",
    textContent: "Vår adress"
  },
  {
    tagName: "A",
    textContent: "Se alla våra kontor",
    pathname: "/kontakt/vara-kontor"
  },
  {
    tagName: "P",
    textContent: "Kontakta oss"
  },
  {
    tagName: "P",
    textContent: "0470 - 78 50 00"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/se/app/fortnox/id1350403648"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/store/apps/details"
  },
  {
    tagName: "P",
    textContent: "Följ oss"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/Fortnoxab/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/company/fortnox/mycompany/"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/fortnoxab"
  },
  {
    tagName: "A",
    textContent: "",
    pathname: "/user/FortnoxAB"
  },
  {
    tagName: "A",
    textContent: "Integritetsmeddelande",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor/integritetsmeddelande"
  },
  {
    tagName: "A",
    textContent: "Cookiepolicy",
    pathname: "/om-fortnox/integritet-och-sakerhet/cookies-pa-fortnox-se"
  },
  {
    tagName: "A",
    textContent: "Integritet och säkerhet ",
    pathname: "/om-fortnox/integritet-och-sakerhet"
  },
  {
    tagName: "A",
    textContent: "Avtal & villkor",
    pathname: "/om-fortnox/integritet-och-sakerhet/avtal-och-villkor"
  },
  {
    tagName: "P",
    textContent: "Cookie-inställningar"
  }
];
const level3data = {
  pathname,
  title,
  items
};
class Heading {
  constructor(text, { x, y }) {
    __publicField(this, "pos");
    __publicField(this, "text");
    this.pos = { x, y };
    this.text = text;
  }
  draw(view, ctx) {
    const { tile } = view;
    const { x, y } = view.resolve(this.pos);
    ctx.fillStyle = "green";
    ctx.fillRect(x - tile * 0.05, 0, tile * 0.1, y);
    ctx.fillRect(x - tile * 1.5, y, tile * 3, tile);
    ctx.fillStyle = "black";
    ctx.fillText(this.text, x, y + tile * 0.6);
  }
  update(view, deltaTime, input) {
  }
}
const doorImages = [door_1, door_2];
const _Door = class {
  constructor(text, pathname2, { x, y }) {
    __publicField(this, "text");
    __publicField(this, "pathname");
    __publicField(this, "pos");
    __publicField(this, "image");
    this.text = text;
    this.pathname = pathname2;
    this.pos = { x, y };
    this.image = doorImages[Math.floor(x % 2)];
  }
  draw(view, ctx) {
    this.drawSign(view, ctx);
    this.drawDoor(view, ctx);
  }
  drawSign(view, ctx) {
    const { tile } = view;
    const { x, y } = view.resolve(this.pos);
    ctx.fillStyle = "red";
    ctx.fillRect(x - tile * 0.05, 0, tile * 0.1, y);
    ctx.fillRect(x - tile * 1.5, y, tile * 3, tile);
    ctx.fillStyle = "black";
    ctx.fillText(this.text, x, y + tile * 0.6);
  }
  drawDoor(view, ctx) {
    const { tile } = view;
    const { x, y } = view.resolve({ x: this.pos.x, y: -2 });
    if (view.debug) {
      const radius = _Door.openThreshold * tile;
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(x, y - radius * 0.5, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.drawImage(
      this.image,
      0,
      0,
      343.3,
      458.05,
      x - tile,
      y - tile * 2,
      tile * 2,
      tile * 2
    );
  }
  update(view, deltaTime, input) {
  }
};
let Door = _Door;
__publicField(Door, "openThreshold", 1.5);
function drawTextMultipleLines(ctx, text, x, y, maxWidth) {
  const lines = getLines(ctx, text, maxWidth);
  const offset = Math.sqrt(lines.length - 1) * ctx.canvas.width * 0.01;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(
      lines[i],
      x,
      y + i * ctx.canvas.height * 0.03 - offset,
      maxWidth
    );
  }
}
function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];
  for (var i = 1; i < words.length; i++) {
    var word = words[i];
    var width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
class Paragraph {
  constructor(text, { x, y }) {
    __publicField(this, "pos");
    __publicField(this, "text");
    this.pos = { x, y };
    this.text = text;
  }
  draw(view, ctx) {
    const { tile } = view;
    const { x, y } = view.resolve(this.pos);
    ctx.fillStyle = "white";
    ctx.fillRect(x - tile * 0.05, 0, tile * 0.1, y);
    ctx.fillRect(x - tile * 1.5, y, tile * 3, tile);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = `${view.tile * 0.3}px sans-serif`;
    drawTextMultipleLines(ctx, this.text, x, y + tile * 0.6, tile * 3);
  }
  update(view, deltaTime, input) {
  }
}
class Title {
  constructor({ title: title2, pathname: pathname2 }) {
    __publicField(this, "title");
    __publicField(this, "pathname");
    this.title = title2;
    this.pathname = pathname2;
  }
  draw(view, ctx) {
    const { tile } = view;
    ctx.fillStyle = "purple";
    ctx.fillRect(tile * 0.3, tile * 0.3, tile * 7, tile);
    ctx.fillStyle = "white";
    ctx.font = `${view.tile * 0.2}px sans-serif`;
    ctx.fillText(this.title, tile * 3.5, tile * 0.3 + tile * 0.6);
  }
  update(view, deltaTime, input) {
  }
}
const levelsData = [level1data, level2data, level3data];
const levelPathnames = levelsData.map((data) => data.pathname);
class Level {
  constructor(data, scene) {
    __publicField(this, "headings", /* @__PURE__ */ new Set());
    __publicField(this, "doors", /* @__PURE__ */ new Set());
    __publicField(this, "paragraphs", /* @__PURE__ */ new Set());
    __publicField(this, "title");
    __publicField(this, "background");
    __publicField(this, "data");
    this.data = data;
    this.title = new Title(data);
    this.background = new Background(scene);
    for (const [index2, item] of data.items.slice(0, 100).entries()) {
      if (item.tagName === "A" && item.pathname && levelPathnames.includes(item.pathname)) {
        this.doors.add(
          new Door(item.textContent, item.pathname, {
            x: index2 * 10,
            y: -6
          })
        );
      } else if (item.tagName === "P" || item.tagName === "A") {
        this.paragraphs.add(
          new Paragraph(item.textContent, {
            x: index2 * 10,
            y: -9 + Math.random() * 5
          })
        );
      } else if (/^H[1-6]$/.test(item.tagName)) {
        this.headings.add(
          new Heading(item.textContent, {
            x: index2 * 10,
            y: -9 + Math.random() * 5
          })
        );
      }
    }
  }
  draw(view, ctx) {
    this.background.draw(view, ctx);
    for (const paragraph of this.paragraphs)
      paragraph.draw(view, ctx);
    for (const heading of this.headings)
      heading.draw(view, ctx);
    for (const door of this.doors)
      door.draw(view, ctx);
    this.title.draw(view, ctx);
  }
  update(view, deltaTime, input) {
    this.background.update(view, deltaTime, input);
    for (const paragraph of this.paragraphs) {
      paragraph.update(view, deltaTime, input);
    }
    for (const heading of this.headings) {
      heading.update(view, deltaTime, input);
    }
    for (const door of this.doors) {
      door.update(view, deltaTime, input);
    }
  }
}
const stateImages = {
  idle: [player_idle_1, player_idle_2, player_idle_3],
  walking: [player_walking_1, player_walking_2],
  jumping: [player_jump_1, player_jump_2, player_jump_3, player_jump_4]
};
class Player {
  constructor({ x, y }, groundLevel) {
    __publicField(this, "state", PlayerState.idle);
    __publicField(this, "pos");
    __publicField(this, "vel", { x: 0, y: 0 });
    __publicField(this, "groundLevel");
    __publicField(this, "jumpTime");
    __publicField(this, "gravity", 0.05);
    __publicField(this, "frameX", 0);
    __publicField(this, "frameTimer", 0);
    __publicField(this, "frameInterval", 1e3 / 2);
    this.pos = { x, y };
    this.groundLevel = groundLevel;
  }
  draw(view, ctx) {
    const { pos, vel } = this;
    const { x, y } = view.resolve(pos);
    const radius = view.tile;
    if (view.debug) {
      ctx.fillStyle = this.state === PlayerState.jumping ? "red" : this.state === PlayerState.walking ? "green" : "blue";
      ctx.beginPath();
      ctx.arc(x - radius, y - radius, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.save();
    let scaleX = 1;
    if (vel.x < 0) {
      scaleX = -1;
      ctx.scale(scaleX, 1);
    }
    ctx.drawImage(
      stateImages[this.state][this.frameX],
      0,
      0,
      275.12,
      250.83,
      scaleX === 1 ? x - radius * 2 : -x,
      y - radius * 2,
      radius * 2,
      radius * 2
    );
    ctx.restore();
    if (view.debug) {
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = `${view.tile * 0.3}px sans-serif`;
      ctx.fillText(
        `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)} | ${vel.x.toFixed(
          1
        )}, ${vel.y.toFixed(1)}`,
        x - radius,
        y - radius * 2.1
      );
    }
  }
  update(view, deltaTime, input) {
    const { vel, pos } = this;
    const inAir = pos.y < this.groundLevel;
    if (this.frameTimer < this.frameInterval)
      this.frameTimer += deltaTime;
    else {
      this.frameTimer = 0;
      this.frameX = (this.frameX + 1) % stateImages[this.state].length;
    }
    const xmaxspd = pos.y < 0 ? 0.5 : 1;
    vel.x = vel.x + 0.01 * (input.keys.left ? -1 : input.keys.right ? 1 : 0);
    vel.x = clamp(-xmaxspd, vel.x, xmaxspd);
    if (input.keys.left) {
      if (vel.x > 0)
        vel.x = 0;
    } else if (input.keys.right) {
      if (vel.x < 0)
        vel.x = 0;
    } else if (!inAir) {
      vel.x = 0;
    }
    if (inAir)
      vel.y += this.gravity;
    if (input.keys.up) {
      if (!inAir)
        this.jump(view);
    } else if (input.keys.down) {
      vel.y += this.gravity;
    } else {
      if (!inAir)
        vel.y = 0;
    }
    const next = nextState(vel);
    if (next !== this.state) {
      this.state = next;
      this.frameX = 0;
      this.frameTimer = 0;
    }
    pos.x += vel.x * deltaTime * 0.03;
    pos.y = Math.min(this.groundLevel, pos.y + vel.y * deltaTime * 0.03);
  }
  jump(view) {
    this.vel.y = -0.6;
    this.state = PlayerState.jumping;
    if (!view.debug) {
      jump_sound.volume = 0.2;
      jump_sound.play();
    }
  }
}
var PlayerState = /* @__PURE__ */ ((PlayerState2) => {
  PlayerState2["idle"] = "idle";
  PlayerState2["walking"] = "walking";
  PlayerState2["jumping"] = "jumping";
  return PlayerState2;
})(PlayerState || {});
function nextState(vel) {
  if (vel.y !== 0) {
    return "jumping";
  } else if (vel.x !== 0) {
    return "walking";
  } else {
    return "idle";
  }
}
function clamp(min, val, max) {
  return Math.min(Math.max(min, val), max);
}
class Startscreen {
  constructor() {
    __publicField(this, "view");
    this.view = true;
  }
  draw(view, ctx) {
    const { tile } = view;
    if (this.view) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        startscreen,
        tile * 1.5,
        tile * 1.5,
        canvas.width - tile * 3,
        canvas.height - tile * 3
      );
    }
  }
  update(view, deltaTime, input) {
    if (input.firstInteraction === true) {
      this.view = false;
    }
  }
}
class Viewport {
  constructor(target) {
    __publicField(this, "offset", { x: 0, y: 0 });
    __publicField(this, "size", { width: 0, height: 0 });
    __publicField(this, "tile", 1);
    __publicField(this, "ratio", 1);
    __publicField(this, "debug", false);
    __publicField(this, "target");
    __publicField(this, "onResize", () => {
      canvas.width = innerWidth * 2;
      canvas.height = innerHeight * 2;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      this.ratio = canvas.width / canvas.height;
      const height = 10;
      const width = height * this.ratio;
      this.size = { height, width };
      this.tile = canvas.height / this.size.height;
    });
    this.target = target;
    addEventListener("resize", this.onResize);
    addEventListener("orientationchange", this.onResize);
    this.onResize();
  }
  draw(view, ctx) {
  }
  update(view, deltaTime, input) {
  }
  resolve(pos) {
    const x = (pos.x - this.min.x) * this.tile;
    const y = (pos.y + this.min.y) * this.tile;
    return { x, y };
  }
  get min() {
    const mid = this.target.pos;
    const { width } = this.size;
    const { offset } = this;
    const x = mid.x + offset.x - width / 2;
    const y = 10;
    return { x, y };
  }
  get max() {
    const mid = this.target.pos;
    const { width } = this.size;
    const { offset } = this;
    const x = mid.x + offset.x + width / 2;
    const y = 0;
    return { x, y };
  }
}
function init() {
  const ctx = canvas.getContext("2d");
  const player = window.player = new Player({ x: 0, y: 0 }, -1);
  const game = window.game = new Game(player);
  const view = window.view = new Viewport(game.player);
  const input = new InputHandler(view);
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    game.draw(view, ctx);
    game.update(view, deltaTime, input);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
class Game {
  constructor(player) {
    __publicField(this, "player");
    __publicField(this, "levels");
    __publicField(this, "pathname", (_a = location.pathname) == null ? void 0 : _a.replace(/^\/$/, ""));
    __publicField(this, "startscreenView");
    this.player = player;
    this.levels = Object.fromEntries(
      levelsData.map((data, index2) => [
        data.pathname.replace("/sitescroller/", ""),
        new Level(data, sceneData[index2 % sceneData.length])
      ])
    );
    this.startscreenView = new Startscreen();
  }
  get level() {
    return this.levels[this.pathname];
  }
  draw(view, ctx) {
    this.level.draw(view, ctx);
    this.player.draw(view, ctx);
    this.startscreenView.draw(view, ctx);
  }
  update(view, deltaTime, input) {
    this.level.update(view, deltaTime, input);
    this.player.update(view, deltaTime, input);
    this.startscreenView.update(view, deltaTime, input);
    if (this.player.state === PlayerState.jumping) {
      const door = findDoorNearby(this.player.pos, this.level.doors);
      if (door) {
        history.pushState({}, "", door.pathname);
        this.pathname = door.pathname;
        this.player.pos.x = 0;
      }
    }
  }
}
function findDoorNearby(pos, doors) {
  const match = [...doors].map((door2) => ({ distance: getDistance(pos, door2.pos), door: door2 })).sort(sortBy(({ distance: distance2 }) => distance2))[0];
  if (!match)
    return null;
  const { distance, door } = match;
  if (distance > 3)
    return null;
  return door;
}
function getDistance(pos1, pos2) {
  return Math.hypot(pos2.y - pos1.y, pos2.x - pos1.x);
}
function sortBy(mapper, order = "asc") {
  return function sortBy2(a, b) {
    const av = mapper(a);
    const bv = mapper(b);
    if (order === "asc")
      return av < bv ? -1 : av > bv ? 1 : 0;
    return av < bv ? 1 : av > bv ? -1 : 0;
  };
}
const index = "";
init();
