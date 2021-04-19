const shouldUpdateScroll = ({ routerProps: { location } }) => {
  const isModal = location.state ? location.state.modal : null;
  const preventUpdateScroll = location.state ? location.state.noScroll : null;

  return !isModal && !preventUpdateScroll;
};

export default shouldUpdateScroll;
