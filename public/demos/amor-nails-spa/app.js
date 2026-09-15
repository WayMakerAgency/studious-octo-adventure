/* ============================================================
   Amor Nails & Spa — demo site interactions
   1) Reveal-on-scroll       2) Demo AI Receptionist (rule-based)
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Reveal on scroll ---------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- Salon facts (verified 2026-09-12) ---------------- */
  var PHONE = "(512) 326-8383";
  var ADDRESS = "5510 S I-35 Frontage Rd Ste 130, Austin, TX 78745";

  /* ---------------- Demo AI Receptionist ---------------- */
  var launcher = document.getElementById("chatLauncher");
  var panel = document.getElementById("chatPanel");
  var body = document.getElementById("chatBody");
  var chipsEl = document.getElementById("chatChips");
  var form = document.getElementById("chatForm");
  var input = document.getElementById("chatInput");

  var opened = false;
  var busy = false;

  var SUGGESTIONS = [
    "What services do you offer?",
    "Where are you located?",
    "What are your hours?",
    "How do I book?",
    "Do you do gel nails?",
    "Call the salon"
  ];

  /* Rule-based brain. Each intent: label + matcher + reply builder. */
  var INTENTS = [
    {
      label: "hours",
      match: /hour|open|close|time|when|today|sunday|monday|tuesday|wednesday|thursday|friday|saturday|weekend/i,
      reply: function () {
        return "We're confirming our hours for this demo! \uD83D\uDD50 Visit the <b>Hours</b> section on this page, or call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> and our team will tell you today's hours.";
      }
    },
    {
      label: "services",
      match: /service|manicure|pedicure|gel|dip|acrylic|nail|wax|brow|spa|polish|treatment|menu|offer|do you do/i,
      reply: function () {
        return "We're a full-service nail &amp; waxing studio \uD83D\uDC85 — <b>manicures, pedicures, gel polish, dip powder, acrylics, and waxing</b>. Want a specific service? Call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> and we'll get you booked.";
      }
    },
    {
      label: "pricing",
      match: /price|pricing|cost|how much|rate|charge|fee|\$/i,
      reply: function () {
        return "Our full menu is available at the salon \uD83D\uDCB0 — for current pricing on any service, call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> and we'll happily walk you through options for your budget.";
      }
    },
    {
      label: "location",
      match: /where|located|location|address|direction|map|find|come|parking|drive|distance/i,
      reply: function () {
        return "You can find us at <b>" + ADDRESS + "</b> \uD83D\uDCCD We're on the S I-35 Frontage Rd — tap <b>Get Directions</b> in the Visit Us section for turn-by-turn directions.";
      }
    },
    {
      label: "contact",
      match: /phone|number|call|contact|text|email|reach|talk|speak|person|human/i,
      reply: function () {
        return "You can reach us at <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> \uD83D\uDCDE I'm the AI receptionist — I answer calls and chats 24/7, so you'll always get a quick response!";
      }
    },
    {
      label: "booking",
      match: /book|appointment|reserve|schedule|slot|available|walk|reservation|when can i come/i,
      reply: function () {
        return "Booking is easy! \uD83D\uDCC5 Just call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> and our receptionist will find the perfect time for you. (When the real site launches, online booking can connect to your favorite scheduling app.)";
      }
    },
    {
      label: "rating",
      match: /rating|review|star|good|recommend|best|quality|liked/i,
      reply: function () {
        return "We're so proud of our <b>4.9\u2605 rating from 4,211 Google reviews</b> \uD83D\uDC96 Thank you, Austin! If you'd like to see what clients say, search \u201CAmor Nails &amp; Spa\u201D on Google.";
      }
    },
    {
      label: "greeting",
      match: /^(hi|hello|hey|howdy|good (morning|afternoon|evening)|yo|sup)\b/i,
      reply: function () {
        return "Hi there! \uD83D\uDC4B Welcome to Amor Nails &amp; Spa — I'm the AI receptionist. Ask me about <b>services</b>, <b>location</b>, <b>hours</b>, or <b>booking</b> — or call " + PHONE + " anytime.";
      }
    },
    {
      label: "thanks",
      match: /thank|thanks|thx|appreciate|great|awesome|perfect/i,
      reply: function () {
        return "You're so welcome! \uD83D\uDC9C Is there anything else I can help with — services, directions, hours, or booking?";
      }
    },
    {
      label: "bye",
      match: /bye|goodbye|see you|farewell|gtg|cya/i,
      reply: function () {
        return "Thanks for stopping by! \uD83C\uDF39 Call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a> anytime — we'd love to see you at Amor Nails &amp; Spa!";
      }
    },
    {
      label: "owner",
      match: /owner|who (built|made|runs|owns)|zynthos|demo|real website|your website/i,
      reply: function () {
        return "Great question! \uD83D\uDC4D This is a <b>free demo website</b> created by <b>ZYNTHOS</b> — an AI studio that helps local businesses get online with a beautiful website and a 24/7 AI receptionist like me. Ask the salon about it!";
      }
    }
  ];

  var FALLBACK = function () {
    return "Hmm, I don't have a confident answer for that one yet — I'm a demo after all! \uD83D\uDE0A For anything specific, call <a href='tel:+15123268383' style='color:#A45A63;font-weight:600;'>" + PHONE + "</a>, or ask me about <b>services</b>, <b>location</b>, <b>hours</b>, or <b>booking</b>.";
  };

  function getReply(text) {
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].match.test(text)) return INTENTS[i].reply();
    }
    return FALLBACK();
  }

  /* ---------------- Rendering helpers ---------------- */
  function scrollBody() { body.scrollTop = body.scrollHeight; }

  function addTyping() {
    var m = document.createElement("div");
    m.className = "msg bot";
    m.innerHTML = "<span class='avatar'>\u2728</span><div class='bubble typing'><span></span><span></span><span></span></div>";
    m.id = "typingMsg";
    body.appendChild(m);
    scrollBody();
  }
  function removeTyping() {
    var t = document.getElementById("typingMsg");
    if (t) t.remove();
  }

  function showChips() {
    chipsEl.innerHTML = "";
    SUGGESTIONS.forEach(function (s) {
      var c = document.createElement("button");
      c.className = "chip";
      c.type = "button";
      c.textContent = s;
      c.addEventListener("click", function () { userSay(s); });
      chipsEl.appendChild(c);
    });
  }

  function hideChips() { chipsEl.innerHTML = ""; }

  /* Typewriter effect */
  function typeInto(el, html, done) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    var fullText = tmp.textContent;                 // plain text (for typing)
    var finalHTML = html;                           // HTML (with links) shown after typing
    var i = 0;
    el.classList.add("typing-caret");
    function tick() {
      i++;
      el.textContent = fullText.slice(0, i);
      if (i < fullText.length) {
        el.appendChild(spanCaret());
        window.setTimeout(tick, 10 + Math.random() * 14);
      } else {
        el.innerHTML = finalHTML;
        done();
      }
    }
    tick();
  }
  function spanCaret() {
    var s = document.createElement("span");
    s.className = "caret";
    return s;
  }

  function botSay(html) {
    hideChips();
    addTyping();
    busy = true;
    window.setTimeout(function () {
      removeTyping();
      var m = document.createElement("div");
      m.className = "msg bot";
      m.innerHTML = "<span class='avatar'>\u2728</span>";
      var b = document.createElement("div");
      b.className = "bubble";
      m.appendChild(b);
      body.appendChild(m);
      scrollBody();
      typeInto(b, html, function () {
        scrollBody();
        window.setTimeout(function () { busy = false; showChips(); }, 350);
      });
    }, 550 + Math.random() * 450);
  }

  function userSay(text) {
    if (busy || !text.trim()) return;
    var m = document.createElement("div");
    m.className = "msg user";
    m.innerHTML = "<span class='avatar'>\uD83D\uDC8B</span><div class='bubble'></div>";
    m.querySelector(".bubble").textContent = text.trim();
    body.appendChild(m);
    scrollBody();
    hideChips();
    window.setTimeout(function () { botSay(getReply(text.trim())); }, 420);
  }

  /* ---------------- Open / close ---------------- */
  function openChat() {
    opened = true;
    document.getElementById("chat").classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    window.setTimeout(function () { input.focus({ preventScroll: true }); }, 300);
    if (!body.children.length) welcome();
  }
  function closeChat() {
    opened = false;
    document.getElementById("chat").classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  }
  launcher.addEventListener("click", function () { opened ? closeChat() : openChat(); });

  /* Auto-open after a moment so the demo feels alive */
  window.setTimeout(openChat, 1100);

  /* ---------------- Welcome ---------------- */
  var welcomed = false;
  function welcome() {
    welcomed = true;
    botSay("Hi! \uD83D\uDC4B I'm Amor's <b>AI receptionist</b> \u2014 I answer calls &amp; chats <b>24/7</b>. Ask me about our services, location, hours, or booking \u2014 or tap a suggestion below!");
  }

  /* ---------------- Send on submit ---------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    userSay(v);
  });
})();