/**
 * Contact form behaviour — extracted from contact.html's inline <script>
 * (2026-08-13) so the site can enforce `script-src 'self'`. This was the only
 * inline script on the site; with it externalised, an injected <script> tag
 * anywhere on the page is blocked by CSP instead of executing.
 *
 * Loaded with `defer` from the head. Behaviour is unchanged: character
 * counter, client-side re-validation, JSON POST to /api/contact, and the
 * mailto fallback that preserves the visitor's message when the endpoint
 * cannot deliver — the lead is never dropped on the floor.
 */
    (function () {
      var message = document.getElementById("message");
      var count = document.getElementById("char-count");
      if (message && count) {
        message.addEventListener("input", function () {
          count.textContent = String(message.value.length);
        });
      }

      var form = document.getElementById("inquiry");
      var status = document.getElementById("inquiry-status");
      var submit = document.getElementById("inquiry-submit");
      if (!form || !status || !submit) return;

      var MAILTO = "hello@formintel.co";

      function set(state, html) {
        status.setAttribute("data-state", state);
        status.innerHTML = html;
      }

      /* Never lose the lead. If the API cannot deliver, hand the visitor a
         prefilled mail link so their message survives the failure. */
      function fallback(reason, data) {
        var body =
          "Name: " + (data.name || "") + "\nOrganization: " + (data.organization || "") +
          "\nRole: " + (data.role || "") + "\n\n" + (data.message || "");
        var href =
          "mailto:" + MAILTO +
          "?subject=" + encodeURIComponent("Inquiry — " + (data.organization || data.name || "")) +
          "&body=" + encodeURIComponent(body);
        set("error",
          reason + ' Your message has not been lost — ' +
          '<a href="' + href + '">open it in your email app</a> ' +
          'or write to <a href="mailto:' + MAILTO + '">' + MAILTO + '</a>.');
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var fd = new FormData(form);
        var data = {};
        fd.forEach(function (v, k) { data[k] = v; });
        data.orgType = data["org-type"] || "";

        var missing = ["name", "email", "organization", "message"].filter(function (f) {
          return !String(data[f] || "").trim();
        });
        if (missing.length) {
          set("error", "Please complete: " + missing.join(", ") + ".");
          return;
        }

        submit.disabled = true;
        set("sending", "Sending…");

        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (r) {
            return r.json().then(function (j) { return { status: r.status, body: j }; });
          })
          .then(function (res) {
            if (res.status === 200 && res.body.ok) {
              form.reset();
              if (count) count.textContent = "0";
              set("ok", "Thank you — that reached us. We review every inquiry and will follow up personally.");
              return;
            }
            if (res.status === 400 && res.body.errors) {
              set("error", "Please check: " + res.body.errors.join(" "));
              return;
            }
            if (res.status === 429) {
              set("error", res.body.error || "Too many attempts. Please try again shortly.");
              return;
            }
            fallback(res.body.error || "We could not send that just now.", data);
          })
          .catch(function () {
            fallback("We could not reach the server.", data);
          })
          .then(function () { submit.disabled = false; });
      });
    })();
