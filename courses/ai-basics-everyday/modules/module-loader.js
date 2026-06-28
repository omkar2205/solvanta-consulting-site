(() => {
  const script = document.currentScript;
  const payload = script?.dataset.payload;
  const title = script?.dataset.title || 'course module';

  const setStatus = (message) => {
    const status = document.querySelector('[data-module-status]');
    if (status) status.textContent = message;
  };

  const decodePayload = async (buffer) => {
    const bytes = new Uint8Array(buffer);
    const looksCompressed = bytes[0] === 0x1f && bytes[1] === 0x8b;

    if (!looksCompressed) {
      return new TextDecoder().decode(bytes);
    }

    if (!('DecompressionStream' in window)) {
      throw new Error('This browser cannot open the compressed lesson. Please use a current version of Chrome, Edge, Firefox, or Safari.');
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };

  const loadModule = async () => {
    try {
      if (!payload) throw new Error('Missing lesson payload.');

      setStatus(`Loading ${title}...`);
      const response = await fetch(payload, { cache: 'default' });
      if (!response.ok) throw new Error(`Could not load ${title}.`);

      const html = await decodePayload(await response.arrayBuffer());
      const frame = document.querySelector('[data-module-frame]');
      if (!frame) throw new Error('Missing lesson frame.');

      frame.hidden = false;
      const frameDocument = frame.contentDocument || frame.contentWindow.document;
      frameDocument.open();
      frameDocument.write(html);
      frameDocument.close();
      setStatus('');
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'This lesson could not be loaded.');
      document.body.classList.add('module-load-error');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModule);
  } else {
    loadModule();
  }
})();
