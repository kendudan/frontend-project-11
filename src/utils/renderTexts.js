export default (i18n, elements) => {
  elements.projectNameHeader.textContent = i18n.t('headerProjectName');
  elements.headerTagline.textContent = i18n.t('headerTagline');
  elements.placeholder.textContent = i18n.t('placeholder');
  elements.button.textContent = i18n.t('button');
  elements.example.textContent = i18n.t('example');
};
