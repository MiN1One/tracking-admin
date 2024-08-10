export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

export const findElPosition = (selector) => {
  let el = document.querySelector(selector);
  let currenttop = 0;
  if (el?.offsetParent) {
    do {
      currenttop += el.offsetTop;
    } while ((el = el.offsetParent));
    return currenttop;
  }
};