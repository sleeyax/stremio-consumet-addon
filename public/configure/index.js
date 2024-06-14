function changeDomain() {
  updateLink();
}

function changeCustomDomain() {
  updateLink();
}

function installAddon() {
  navigator.clipboard.writeText(
    installLink.href.replace('stremio://', 'https://')
  );
}

async function updateLink() {
  const mainForm = new FormData(document.getElementById('mainForm'));
  const domain = mainForm.get('custom') || mainForm.get('domain');
  changeStatus({ statusText: 'checking', time: 0 });
  changeStatus(await getDomainStatus(domain));
  installLink.href = `stremio://${window.location.host}/${domain}/manifest.json`;
}

function changeStatus(status) {
  const { statusText, time } = status;
  const statusElement = document.getElementById('status');
  statusElement.className = statusText;
  statusElement.innerText = statusText;
  if (time !== 0) {
    statusElement.innerText += ` (${time}ms)`;
  }
}

async function getDomainStatus(domain) {
  try {
    const res = await fetch(`/configure/test/${domain}`);
    const data = await res.json();
    return {
      statusText: data.ok === true ? 'success' : 'error',
      time: data.time,
    };
  } catch (e) {
    console.error(e);
    return 'unknown';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  updateLink();
});
