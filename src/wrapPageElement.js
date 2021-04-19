import { navigate } from "gatsby";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import ModalRoutingContext from "./ModalRoutingContext";

const withoutPrefix = (path) => {
  const prefix =
    typeof __BASE_PATH__ !== `undefined` ? __BASE_PATH__ : __PATH_PREFIX__;

  return path.slice(prefix ? prefix.length : 0);
};
const WrapPageElement = (props) => {
  const [isPrevProps, setIsPrevProps] = useState("");
  const [isLastModalProps, setIsLastModalProps] = useState("");
  const [isPathname, setIsPathname] = useState("");
  let modalContentRef = null;

  useEffect(() => {
    if (props.location.pathname !== isPathname) {
      setIsPathname(props?.location?.pathname);
      if (props?.location?.state?.modal) {
        // old page was a modal, keep track so we can render the contents while closing
        setIsLastModalProps(props);
      } else {
        // old page was not a modal, keep track so we can render the contents under modals
        setIsPrevProps(props);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (
      isPrevProps &&
      isPrevProps?.location?.setIsPathname !== props?.location?.pathname &&
      props?.location?.state?.modal &&
      modalContentRef
    ) {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }
  }, [isPrevProps]);

  const handleRequestClose = () => {
    navigate(withoutPrefix(isPrevProps?.location?.pathname), {
      state: {
        noScroll: true,
      },
    });
  };

  // render modal if props location has modal
  const { pageResources, location, modalProps } = props;

  const isModal = isPrevProps && location.state && location?.state?.modal;

  // the page is the previous path if this is a modal, otherwise it's the current path
  const pageElement = isModal
    ? React.createElement(isPrevProps.pageResources.component, {
        ...isPrevProps,
        key: isPrevProps.pageResources.page.path,
      })
    : React.createElement(pageResources.component, {
        ...props,
        key: pageResources.page.path,
      });

  let modalElement = null;

  if (isModal) {
    // Rendering the current page as a modal, so create an element with the page contents
    modalElement = React.createElement(pageResources.component, {
      ...props,
      key: pageResources.page.path,
    });
  } else if (isLastModalProps) {
    // Not rendering the current page as a modal, but we may be in the process of animating
    // the old modal content to close, so render the last modal content we have cached

    modalElement = React.createElement(
      isLastModalProps.pageResources.component,
      {
        ...isLastModalProps,
        key: isLastModalProps.pageResources.page.path,
      }
    );
  }

  return (
    <>
      {pageElement}

      <Modal
        onRequestClose={handleRequestClose}
        contentRef={(node) => (modalContentRef = node)}
        {...modalProps}
        isOpen={!!isModal}
      >
        {modalElement ? (
          <React.Fragment key={props.location.key}>
            <ModalRoutingContext.Provider
              value={{
                modal: true,
                closeTo: isPrevProps
                  ? withoutPrefix(isPrevProps.location.pathname)
                  : "/",
              }}
            >
              {modalElement}
            </ModalRoutingContext.Provider>
          </React.Fragment>
        ) : null}
      </Modal>
    </>
  );
};

const wrapPageElement = ({ props }, opts) => {
  const { modalProps } = opts;
  return React.createElement(WrapPageElement, {
    ...props,
    modalProps,
  });
};

export default wrapPageElement;
