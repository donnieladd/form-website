(() => {
  const header = document.querySelector('[data-header]');
  const explorer = document.querySelector('[data-service-explorer]');
  const inquiry = document.querySelector('[data-inquiry]');

  const serviceData = {
    revenue: ['REVENUE SYSTEMS', 'Turn demand into a path your team can operate.', 'We clarify the first signal, the handoff, the qualification logic, and the follow-up rhythm so opportunity stops depending on memory or heroic manual effort.', ['Lead capture', 'CRM movement', 'Sales follow-up', 'Decision visibility'], 'The right person sees the right next step before the opportunity cools.'],
    operations: ['OPERATIONS SYSTEMS', 'Reduce friction across the work that keeps the company moving.', 'We map handoffs, documents, approvals, reporting, and recurring work, then rebuild the path so the team can move with less drag and fewer invisible dependencies.', ['Workflow map', 'Automation rules', 'Approval logic', 'Reporting cadence'], 'People spend less energy chasing the process and more energy advancing the work.'],
    workforce: ['AI WORKFORCE SYSTEMS', 'Put intelligent capacity beside people, with responsibility intact.', 'We design agentic workflows around clear permissions, human checkpoints, escalation paths, and measurable outputs instead of novelty demos that cannot survive real operations.', ['Agent roles', 'Tool access', 'Human review', 'Audit trail'], 'The organization gains capacity without surrendering judgment or accountability.'],
    intelligence: ['KNOWLEDGE & INTELLIGENCE SYSTEMS', 'Make organizational knowledge usable when decisions happen.', 'We connect documents, data, context, and decision moments so the company can retrieve what it knows instead of asking people to remember everything under pressure.', ['Knowledge sources', 'Retrieval logic', 'Decision context', 'Governance'], 'Leaders and teams make decisions with a more complete picture of the business.'],
    experience: ['CUSTOMER EXPERIENCE SYSTEMS', 'Design the moments where people meet the operation.', 'We improve intake, communication, status visibility, and follow-through so customers feel the competence of the business before anyone explains it.', ['Intake path', 'Status signals', 'Service moments', 'Follow-through'], 'Customers experience clarity, speed, and confidence at the places that matter.'],
    growth: ['GROWTH SYSTEMS', 'Build an operating foundation strong enough for the next stage.', 'We connect strategy, pipeline, delivery capacity, measurement, and improvement loops so growth does not outpace the company’s ability to deliver.', ['Pipeline', 'Capacity model', 'Performance signals', 'Improvement loop'], 'Growth becomes more intentional, more visible, and less dependent on improvisation.']
  };

  const setService = (key) => {
    const data = serviceData[key];
    if (!data || !explorer) return;
    explorer.querySelectorAll('[data-service]').forEach((button) => {
      const active = button.dataset.service === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    const panel = explorer.querySelector('.service-panel');
    panel?.classList.add('is-changing');
    window.setTimeout(() => panel?.classList.remove('is-changing'), 180);
    explorer.querySelector('[data-service-kicker]').textContent = data[0];
    explorer.querySelector('[data-service-title]').textContent = data[1];
    explorer.querySelector('[data-service-copy]').textContent = data[2];
    ['a', 'b', 'c', 'd'].forEach((slot, index) => {
      explorer.querySelector(`[data-service-part-${slot}]`).textContent = data[3][index];
    });
    explorer.querySelector('[data-service-outcome]').textContent = data[4];
  };

  const updateChrome = () => {
    header?.classList.toggle('is-solid', window.scrollY > 24);
    if (header) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      header.style.setProperty('--header-progress', `${pct * (window.innerWidth - 84)}px`);
    }
  };
  window.addEventListener('scroll', updateChrome, { passive: true });
  window.addEventListener('resize', updateChrome);
  updateChrome();

  explorer?.querySelectorAll('[data-service]').forEach((button) => {
    button.addEventListener('click', () => setService(button.dataset.service));
  });
  document.querySelectorAll('[data-service-link]').forEach((link) => {
    link.addEventListener('click', () => setService(link.dataset.serviceLink));
  });

  const previewTitle = inquiry?.querySelector('[data-preview-title]');
  const previewBody = inquiry?.querySelector('[data-preview-body]');
  const updatePreview = () => {
    if (!inquiry || !previewTitle || !previewBody) return;
    const pressure = inquiry.querySelector('input[name="pressure"]:checked')?.value || 'Business pressure';
    const reality = inquiry.querySelector('textarea[name="reality"]')?.value.trim();
    previewTitle.textContent = pressure;
    previewBody.textContent = reality || 'Tell us where the work is breaking down. The better the operating truth, the sharper the system architecture.';
  };
  inquiry?.addEventListener('input', updatePreview);

  const storyMachine = document.querySelector('[data-story-machine]');
  const storyData = {
    request: ['01 / Request received', 'INTAKE', 'A buyer names the pressure instead of guessing the service.', 'The system captures the business reality, contact context, and urgency without forcing the visitor into a generic sales form.'],
    qualify: ['02 / Context structured', 'QUALIFICATION', 'The pressure becomes a readable operating pattern.', 'Signals are grouped into systems, people, data, tools, risks, and decision points so the first conversation starts above the surface.'],
    decision: ['03 / Human review', 'RESPONSIBLE DECISION', 'A person decides what deserves action.', 'AI can organize the context, but the fit, priority, and next useful move stay accountable to human judgment.'],
    follow: ['04 / Next step activated', 'FOLLOW-THROUGH', 'The system creates movement after the conversation.', 'The next step is documented, assigned, and visible so momentum does not depend on memory, charisma, or another meeting.']
  };
  const setStory = (key) => {
    const data = storyData[key];
    if (!data || !storyMachine) return;
    storyMachine.querySelectorAll('[data-story]').forEach((button) => {
      const active = button.dataset.story === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    storyMachine.querySelector('[data-story-status]').textContent = data[0];
    storyMachine.querySelector('[data-story-kicker]').textContent = data[1];
    storyMachine.querySelector('[data-story-title]').textContent = data[2];
    storyMachine.querySelector('[data-story-copy]').textContent = data[3];
  };
  storyMachine?.querySelectorAll('[data-story]').forEach((button) => {
    button.addEventListener('click', () => setStory(button.dataset.story));
  });

  const form = inquiry?.querySelector('form');
  const formStatus = document.getElementById('inquiry-status');
  const submit = form?.querySelector('button[type="submit"]');
  const setStatus = (state, message) => {
    if (!formStatus) return;
    formStatus.dataset.state = state;
    formStatus.textContent = message;
  };
  const mailFallback = (data) => {
    const body = `Name: ${data.name || ''}\nOrganization: ${data.organization || ''}\nEmail: ${data.email || ''}\nBusiness pressure: ${data.pressure || ''}\n\n${data.message || ''}`;
    return `mailto:hello@formintel.co?subject=${encodeURIComponent(`Inquiry — ${data.organization || data.name || ''}`)}&body=${encodeURIComponent(body)}`;
  };
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.message = `Business pressure: ${data.pressure || 'Not specified'}\n\n${data.reality || ''}`.trim();
    if (!data.name || !data.organization || !data.email || !data.reality) {
      setStatus('error', 'Please complete your name, organization, email, and current reality.');
      return;
    }
    submit.disabled = true;
    setStatus('sending', 'Sending inquiry…');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (response.ok && result.ok) {
        form.reset();
        updatePreview();
        setStatus('ok', 'Thank you — that reached us. We will follow up personally.');
      } else {
        setStatus('error', 'We could not send that just now. Opening your email app so the inquiry is not lost.');
        window.location.href = mailFallback(data);
      }
    } catch {
      setStatus('error', 'We could not reach the server. Opening your email app so the inquiry is not lost.');
      window.location.href = mailFallback(data);
    } finally {
      submit.disabled = false;
    }
  });


  const revealItems = document.querySelectorAll('[data-reveal]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

})();
