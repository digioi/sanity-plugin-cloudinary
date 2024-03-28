import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { PatchEvent, unset, set, DiffFromTo, defineType, setIfMissing, insert, ArrayOfObjectsFunctions, definePlugin, isArrayOfObjectsSchemaType } from 'sanity';
import { Flex, Stack, Button, Grid, Dialog, Box, Spinner, Text } from '@sanity/ui';
import { PlugIcon } from '@sanity/icons';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import { SettingsView, useSecrets } from '@sanity/studio-secrets';
function VideoPlayer(props) {
  const {
    src
  } = props;
  const style = {
    width: "100%",
    height: "auto"
  };
  return /* @__PURE__ */jsx("video", {
    controls: true,
    style,
    children: /* @__PURE__ */jsx("source", {
      src,
      type: "video/mp4"
    })
  });
}
const widgetSrc = "https://media-library.cloudinary.com/global/all.js";
function assetUrl(asset) {
  if (asset.derived && asset.derived.length > 0) {
    const [derived] = asset.derived;
    if (derived.secure_url) {
      return derived.secure_url;
    }
    return derived.url;
  }
  if (asset.secure_url) {
    return asset.secure_url;
  }
  return asset.url;
}
const openMediaSelector = (cloudName, apiKey, multiple, insertHandler, selectedAsset) => {
  loadJS(widgetSrc, () => {
    const options = {
      cloud_name: cloudName,
      api_key: apiKey,
      insert_caption: "Select",
      multiple
    };
    if (selectedAsset) {
      options.asset = {
        public_id: selectedAsset.public_id,
        type: selectedAsset.type,
        resource_type: selectedAsset.resource_type
      };
    }
    window.cloudinary.openMediaLibrary(options, {
      insertHandler
    });
  });
};
const createMediaLibrary = _ref => {
  let {
    cloudName,
    apiKey,
    inlineContainer,
    libraryCreated,
    insertHandler
  } = _ref;
  loadJS(widgetSrc, () => {
    const options = {
      cloud_name: cloudName,
      api_key: apiKey,
      insert_caption: "Select",
      inline_container: inlineContainer,
      remove_header: true
    };
    libraryCreated(window.cloudinary.createMediaLibrary(options, {
      insertHandler
    }));
  });
};
function loadJS(url, callback) {
  const existingScript = document.getElementById("damWidget");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = url;
    script.id = "damWidget";
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) {
        return callback();
      }
      return true;
    };
  }
  if (existingScript && callback) {
    return callback();
  }
  return true;
}
function encodeSourceId(asset) {
  const {
    resource_type,
    public_id,
    type
  } = asset;
  return btoa(JSON.stringify({
    public_id,
    resource_type,
    type
  }));
}
function encodeFilename(asset) {
  return "".concat(asset.public_id.split("/").slice(-1)[0], ".").concat(asset.format);
}
function decodeSourceId(sourceId) {
  let sourceIdDecoded;
  try {
    sourceIdDecoded = JSON.parse(atob(sourceId));
  } catch (err) {}
  return sourceIdDecoded;
}
const AssetPreview = _ref2 => {
  let {
    value,
    layout
  } = _ref2;
  const url = value && assetUrl(value);
  if (!value || !url) {
    return null;
  }
  switch (value.resource_type) {
    case "video":
      return /* @__PURE__ */jsx(Flex, {
        align: "center",
        style: {
          maxWidth: layout === "default" ? "80px" : "100%"
        },
        children: /* @__PURE__ */jsx(VideoPlayer, {
          src: url,
          kind: "player"
        })
      });
    default:
      return /* @__PURE__ */jsx(Flex, {
        align: "center",
        children: /* @__PURE__ */jsx("img", {
          alt: "preview",
          src: url,
          style: {
            maxWidth: layout === "default" ? "80px" : "100%",
            height: "auto"
          }
        })
      });
  }
};
var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", {
  value: __freeze$1(raw || cooked.slice())
}));
var _a$1;
const SetupButtonContainer = styled.div(_a$1 || (_a$1 = __template$1(["\n  position: relative;\n  display: block;\n  font-size: 0.8em;\n  transform: translate(0%, -10%);\n"])));
const WidgetInput = props => {
  const {
    onChange,
    readOnly,
    value,
    openMediaSelector
  } = props;
  const removeValue = useCallback(() => {
    onChange(PatchEvent.from([unset()]));
  }, [onChange]);
  return /* @__PURE__ */jsxs(Stack, {
    children: [/* @__PURE__ */jsx(SetupButtonContainer, {
      children: /* @__PURE__ */jsx(Flex, {
        flex: 1,
        justify: "flex-end",
        children: /* @__PURE__ */jsx(Button, {
          color: "primary",
          icon: PlugIcon,
          mode: "bleed",
          title: "Configure",
          onClick: props.onSetup,
          tabIndex: 1
        })
      })
    }), /* @__PURE__ */jsx(Flex, {
      style: {
        textAlign: "center",
        width: "100%"
      },
      marginBottom: 2,
      children: /* @__PURE__ */jsx(AssetPreview, {
        value
      })
    }), /* @__PURE__ */jsxs(Grid, {
      gap: 1,
      style: {
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))"
      },
      children: [/* @__PURE__ */jsx(Button, {
        disabled: readOnly,
        mode: "ghost",
        title: "Select an asset",
        tone: "default",
        onClick: openMediaSelector,
        text: "Select\u2026"
      }), /* @__PURE__ */jsx(Button, {
        disabled: readOnly || !value,
        tone: "critical",
        mode: "ghost",
        title: "Remove asset",
        text: "Remove",
        onClick: removeValue
      })]
    })]
  });
};
const pluginConfigKeys = [{
  key: "cloudName",
  title: "Cloud name",
  description: ""
}, {
  key: "apiKey",
  title: "API key",
  description: ""
}];
const namespace = "cloudinary";
const SecretsConfigView = props => {
  return /* @__PURE__ */jsx(SettingsView, {
    title: "Cloudinary config",
    namespace,
    keys: pluginConfigKeys,
    onClose: props.onClose
  });
};
const CloudinaryInput = props => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    secrets
  } = useSecrets(namespace);
  const {
    onChange,
    schemaType: type
  } = props;
  const value = props.value || void 0;
  const handleSelect = useCallback(payload => {
    const [asset] = payload.assets;
    if (!asset) {
      return;
    }
    onChange(PatchEvent.from([set(Object.assign({
      _type: type.name,
      _version: 1,
      ...((value == null ? void 0 : value._key) ? {
        _key: value._key
      } : {
        _key: nanoid()
      })
    }, asset))]));
  }, [onChange, type, value == null ? void 0 : value._key]);
  const action = secrets ? () => openMediaSelector(secrets.cloudName, secrets.apiKey, false,
  // single selection
  handleSelect, value) : () => setShowSettings(true);
  return /* @__PURE__ */jsxs(Fragment, {
    children: [showSettings && /* @__PURE__ */jsx(SecretsConfigView, {
      onClose: () => setShowSettings(false)
    }), /* @__PURE__ */jsx(WidgetInput, {
      onSetup: () => setShowSettings(true),
      openMediaSelector: action,
      ...props
    })]
  });
};
const CloudinaryDiffPreview = _ref3 => {
  let {
    value
  } = _ref3;
  if (!value) {
    return null;
  }
  const url = assetUrl(value);
  if (value.resource_type === "video" && url) {
    return /* @__PURE__ */jsx("section", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between"
      },
      children: /* @__PURE__ */jsx(VideoPlayer, {
        src: url,
        kind: "diff"
      })
    });
  }
  return /* @__PURE__ */jsx("img", {
    alt: "preview",
    src: url,
    style: {
      maxWidth: "100%",
      height: "auto"
    }
  });
};
const AssetDiff = _ref4 => {
  let {
    diff,
    schemaType
  } = _ref4;
  return /* @__PURE__ */jsx(DiffFromTo, {
    diff,
    schemaType,
    previewComponent: CloudinaryDiffPreview
  });
};
const cloudinaryAssetSchema = defineType({
  type: "object",
  name: "cloudinary.asset",
  fields: [{
    type: "string",
    name: "public_id"
  }, {
    type: "string",
    name: "resource_type"
    // "image", "?"
  }, {
    type: "string",
    name: "type"
    // "upload", "?"
  }, {
    type: "string",
    name: "format"
    // "jpg"
  }, {
    type: "number",
    name: "version"
  }, {
    type: "url",
    name: "url"
  }, {
    type: "url",
    name: "secure_url"
  }, {
    type: "number",
    name: "width"
  }, {
    type: "number",
    name: "height"
  }, {
    type: "number",
    name: "bytes"
  }, {
    type: "number",
    name: "duration"
    // can be null
  }, {
    type: "array",
    name: "tags",
    of: [{
      type: "string"
    }]
  }, {
    type: "datetime",
    name: "created_at"
  }, {
    type: "array",
    name: "derived",
    of: [{
      type: "cloudinary.assetDerived"
    }]
  }, {
    type: "string",
    name: "access_mode"
  }, {
    type: "cloudinary.assetContext",
    name: "context"
  }
  // metadata array of unknown content
  ],

  ...{
    components: {
      input: CloudinaryInput,
      diff: AssetDiff,
      preview: AssetPreview
    }
  },
  //TODO revert this change when rc.1 is released
  preview: {
    select: {
      url: "url",
      resource_type: "resource_type",
      derived: "derived.0.url"
    },
    prepare(_ref5) {
      let {
        url,
        derived,
        resource_type
      } = _ref5;
      return {
        title: url,
        value: {
          title: url,
          resource_type,
          url: derived || url
        }
      };
    }
  }
});
const cloudinaryAssetDerivedSchema = defineType({
  type: "object",
  name: "cloudinary.assetDerived",
  fields: [{
    type: "string",
    name: "raw_transformation"
  }, {
    type: "url",
    name: "url"
  }, {
    type: "url",
    name: "secure_url"
  }]
});
function CloudinaryIcon() {
  return /* @__PURE__ */jsx("svg", {
    version: "1.1",
    id: "Layer_1",
    x: "0px",
    y: "0px",
    width: "1em",
    height: "1em",
    viewBox: "0 0 141.732 141.747",
    enableBackground: "new 0 0 141.732 141.747",
    children: /* @__PURE__ */jsxs("g", {
      children: [/* @__PURE__ */jsx("path", {
        fill: "#0071CE",
        d: "M115.585,109.242c-1.609,0-3.107-1.024-3.635-2.637c-0.657-2.008,0.438-4.169,2.447-4.826\n        c7.278-2.382,11.98-8.761,11.98-16.252c0-9.487-7.718-17.206-17.205-17.206c-0.659,0-1.368,0.052-2.231,0.164l-3.741,0.485\n        l-0.537-3.735c-2.299-16.016-16.251-28.094-32.454-28.094c-13.395,0-25.32,8.019-30.377,20.43l-0.952,2.335l-2.52,0.046\n        c-11.581,0.213-21.003,9.804-21.003,21.379c0,8.45,4.906,16.156,12.498,19.631c1.921,0.88,2.766,3.15,1.886,5.071\n        c-0.88,1.921-3.149,2.764-5.07,1.887C14.363,103.202,7.703,92.766,7.703,81.331c0-14.88,11.465-27.345,26.028-28.876\n        c6.71-14.03,20.773-22.965,36.477-22.965c18.796,0,35.135,13.178,39.372,31.184c13.519,0.219,24.45,11.284,24.45,24.854\n        c0,10.693-6.934,20.146-17.253,23.523C116.382,109.18,115.98,109.242,115.585,109.242z"
      }), /* @__PURE__ */jsx("path", {
        fill: "#DC8327",
        d: "M57.12,111.02c-0.001-0.001-0.001-0.001-0.002-0.001c-0.001,0-0.002-0.001-0.003-0.001h-0.001\n        c0,0-0.001-0.001-0.001-0.001l-0.001-0.001c0,0-0.001,0-0.001-0.001h-0.001l-0.001-0.001c0.001-0.001-0.001-0.001-0.001-0.001\n        l-0.001-0.001c0,0-0.001,0-0.001,0l-0.001-0.001c0.001,0.001-0.001-0.001-0.001-0.001s-0.002-0.001-0.003-0.001l-0.001-0.001H57.1\n        c-0.001-0.001-0.001-0.001-0.001-0.001l-0.001-0.001c-0.003-0.001-0.002-0.001-0.003-0.001c-0.001,0.001-0.001-0.001-0.002-0.001\n        l-0.001-0.001c0,0-0.001-0.001-0.002-0.001l-0.001-0.001c-0.001-0.001-0.003-0.001-0.004-0.001s-0.003-0.001-0.004-0.001\n        c-0.001-0.001-0.001-0.001-0.002-0.001h-0.001c-0.001-0.001-0.002-0.001-0.003-0.001c-0.001-0.001-0.003-0.001-0.003-0.001\n        c-0.001,0-0.001,0-0.001,0l-0.002-0.001c-0.001,0-0.001-0.001-0.001-0.001h-0.001c-0.059-0.021-0.122-0.034-0.188-0.037h-0.002\n        h-0.002c-0.001,0-0.001,0-0.002,0c0,0,0,0-0.001,0c0,0-0.001,0-0.001,0h-0.001c-0.001-0.001-0.001-0.001-0.001-0.001\n        c-0.001,0-0.002,0-0.002,0c-0.001,0-0.002,0-0.002,0h-0.001h-0.001h-0.001c-0.001,0-0.002,0-0.002,0h-0.001H56.86h-0.001h-0.001\n        c-0.001,0-0.001,0-0.001,0h-0.001h-0.001h-0.001h-0.001c-0.001,0-0.001,0-0.001,0c-1.656,0-3.011-1.348-3.021-3V74.29h2.567\n        c0.004,0,0.009,0,0.013,0c0.393,0.017,0.661-0.285,0.661-0.648c0-0.271-0.166-0.503-0.402-0.6l-12.379-8.544\n        c-0.222-0.153-0.515-0.153-0.737,0l-12.476,8.611c-0.234,0.161-0.335,0.456-0.251,0.727c0.085,0.271,0.335,0.455,0.619,0.455h2.58\n        l0.002,33.674c0.013,2.328,1.883,4.228,4.262,4.288c0.027,0.003,0.053,0.005,0.08,0.005h18.481c0.004,0,0.007,0,0.011,0\n        c0.17-0.003,0.324-0.071,0.438-0.18c0,0,0,0,0.001-0.001c0.002-0.002,0.004-0.004,0.005-0.005c0.001-0.001,0.002-0.001,0.003-0.003\n        c0,0,0.001-0.001,0.001-0.001l0.001-0.001l0.001-0.001l0.001-0.001l0.001-0.001c0.001-0.001,0.001-0.001,0.001-0.001\n        c0.002-0.001,0.001-0.001,0.002-0.002c0,0,0,0,0.001-0.001l0.001-0.001c0,0,0,0,0.001-0.001c0.112-0.116,0.182-0.273,0.183-0.447\n        v-0.002v-0.001v-0.001v-0.001v-0.001v-0.001v-0.001v-0.002C57.498,111.345,57.343,111.121,57.12,111.02z"
      }), /* @__PURE__ */jsx("path", {
        fill: "#F4B21B",
        d: "M83.889,111.02c0,0-0.001-0.001-0.002-0.001c-0.001,0-0.002-0.001-0.003-0.001h-0.001\n        c-0.001-0.001-0.001-0.001-0.001-0.001l-0.001-0.001h-0.001c0,0-0.001-0.001-0.001-0.001c0,0-0.001-0.001-0.001-0.001\n        c0.001-0.001-0.001-0.001-0.002-0.001l-0.001-0.001h-0.001c-0.001,0-0.001-0.001-0.001-0.001c-0.002,0.001-0.002-0.001-0.002-0.001\n        l-0.002-0.001l-0.001-0.001h-0.001c0,0-0.001-0.001-0.001-0.001l-0.001-0.001c-0.001-0.001-0.002-0.001-0.002-0.001\n        c-0.001,0.001-0.001-0.001-0.003-0.001l-0.001-0.001l-0.001-0.001c0,0-0.001,0-0.002-0.001c-0.001-0.001-0.003-0.001-0.004-0.001\n        s-0.003-0.001-0.004-0.001c-0.001-0.001-0.001-0.001-0.002-0.001c-0.001,0-0.001,0-0.002-0.001c0,0-0.001,0-0.002-0.001\n        c-0.003-0.001-0.001-0.001-0.002-0.001c-0.003,0-0.001,0-0.002-0.001c0,0-0.001-0.001-0.002-0.001l-0.001-0.001h-0.001\n        c-0.059-0.021-0.122-0.034-0.188-0.037h-0.002c-0.001,0-0.001,0-0.001,0c-0.001,0-0.002,0-0.002,0s-0.001,0-0.001,0h-0.001h-0.001\n        l-0.001-0.001c-0.001,0-0.002,0-0.002,0c-0.001,0-0.002,0-0.002,0h-0.001c-0.001,0-0.001,0-0.001,0h-0.001\n        c-0.001,0-0.002,0-0.002,0s-0.001,0-0.002,0h-0.001c0,0-0.001,0-0.001,0h-0.001c-0.001,0-0.001,0-0.001,0h-0.001h-0.001h-0.001\n        h-0.001c-0.001,0-0.001,0-0.001,0c-1.655,0-3.01-1.348-3.02-3V81.829h2.579c0.009-0.001,0.016-0.001,0.026,0\n        c0.358,0,0.648-0.29,0.648-0.648c0-0.271-0.166-0.503-0.402-0.6l-12.38-8.544c-0.222-0.153-0.515-0.153-0.737,0L57.86,80.647\n        c-0.234,0.161-0.335,0.456-0.251,0.727c0.085,0.271,0.335,0.455,0.619,0.455h2.568l0.002,26.135\n        c0.011,2.329,1.884,4.23,4.264,4.289c0.026,0.003,0.052,0.004,0.078,0.004h18.481c0.004,0,0.007,0,0.011,0\n        c0.17-0.003,0.324-0.071,0.438-0.18c0,0,0,0,0.001-0.001c0.002-0.002,0.006-0.004,0.005-0.005c0.001-0.001,0.002-0.001,0.003-0.003\n        c0.001-0.001,0.001-0.001,0.001-0.001l0.001-0.001l0.001-0.001c0,0,0.001,0,0.001-0.001l0.001-0.001\n        c0.001,0,0.001-0.001,0.001-0.001c0.003-0.001,0.002-0.001,0.002-0.002c0,0,0,0,0.001-0.001c0,0,0,0,0.001-0.001\n        c0,0,0,0,0.001-0.001c0.112-0.116,0.182-0.273,0.183-0.447v-0.002v-0.001v-0.001v-0.001v-0.001v-0.001v-0.001v-0.002\n        C84.267,111.345,84.112,111.121,83.889,111.02z"
      }), /* @__PURE__ */jsx("path", {
        fill: "#F2D864",
        d: "M110.667,111.02l-0.002-0.001c-0.001,0-0.002-0.001-0.003-0.001h-0.001\n        c-0.001-0.001-0.001-0.001-0.001-0.001l-0.001-0.001c-0.001,0-0.001,0-0.001-0.001h-0.001l-0.001-0.001\n        c-0.001-0.001-0.001-0.001-0.001-0.001s-0.001,0-0.001-0.001h-0.001c0,0-0.001-0.001-0.001-0.001\n        c-0.001,0.001-0.001-0.001-0.002-0.001c0.001-0.001-0.001-0.001-0.002-0.001l-0.001-0.001c-0.001,0-0.001,0-0.001,0\n        c-0.001-0.001-0.001-0.001-0.001-0.001l-0.001-0.001c-0.003-0.001-0.002-0.001-0.002-0.001c-0.001,0.001-0.001-0.001-0.003-0.001\n        l-0.001-0.001c0.001-0.001-0.001-0.001-0.002-0.001c0,0-0.001,0-0.001-0.001c-0.001-0.001-0.003-0.001-0.004-0.001\n        s-0.003-0.001-0.004-0.001l-0.002-0.001c0,0-0.001,0-0.002-0.001l-0.002-0.001c-0.003-0.001-0.003-0.001-0.002-0.001\n        c-0.003,0-0.003,0-0.002-0.001c-0.001,0-0.001-0.001-0.001-0.001c-0.001,0-0.002-0.001-0.002-0.001h-0.001\n        c-0.059-0.021-0.122-0.034-0.188-0.037h-0.001c-0.001,0-0.002,0-0.002,0c-0.001,0-0.002,0-0.003,0h-0.001h-0.001h-0.001\n        c-0.001-0.001-0.001-0.001-0.002-0.001c0,0-0.001,0-0.002,0c0,0-0.001,0-0.002,0h-0.001c0,0-0.001,0-0.001,0h-0.001\n        c-0.001,0-0.002,0-0.002,0h-0.002c0,0,0,0-0.001,0c0,0-0.001,0-0.001,0h-0.001c0,0-0.001,0-0.001,0h-0.001h-0.001h-0.001H110.4\n        c0,0-0.001,0-0.001,0c-1.655,0-3.01-1.348-3.02-3V89.365h2.573c0.004,0,0.009,0,0.013,0c0.365-0.009,0.661-0.285,0.661-0.648\n        c0-0.271-0.166-0.503-0.402-0.6l-12.38-8.544c-0.221-0.153-0.515-0.153-0.737,0l-12.476,8.61c-0.234,0.161-0.335,0.456-0.251,0.727\n        c0.085,0.271,0.335,0.455,0.619,0.455h2.573l0.002,18.599c0.013,2.329,1.885,4.231,4.264,4.289\n        c0.026,0.003,0.052,0.004,0.078,0.004h18.481c0.004,0,0.007,0,0.011,0c0.17-0.003,0.324-0.071,0.438-0.18l0.001-0.001\n        c0.002-0.002,0.005-0.004,0.005-0.005c0.001-0.001,0.002-0.001,0.003-0.003c0,0,0.001-0.001,0.001-0.001l0.001-0.001l0.001-0.001\n        l0.001-0.001l0.001-0.001l0.001-0.001c0.003-0.001,0.001-0.001,0.002-0.002c0,0,0,0,0.001-0.001l0.001-0.001c0,0,0,0,0.001-0.001\n        c0.112-0.116,0.182-0.273,0.183-0.447v-0.002v-0.001v-0.001v-0.001v-0.001v-0.001v-0.001v-0.002\n        C111.045,111.345,110.889,111.121,110.667,111.02z"
      })]
    })
  });
}
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", {
  value: __freeze(raw || cooked.slice())
}));
var _a;
const Widget = styled.div(_a || (_a = __template(["\n  height: 70vh;\n"])));
function CloudinaryAssetSource(props) {
  const {
    onClose
  } = props;
  const [loadingMessage, setLoadingMessage] = useState("Loading Cloudinary Media Libary");
  const library = useRef();
  const contentRef = useRef(null);
  const {
    secrets
  } = useSecrets(namespace);
  const cloudName = secrets == null ? void 0 : secrets.cloudName;
  const apiKey = secrets == null ? void 0 : secrets.apiKey;
  const [widgetId] = useState(() => "cloundinaryWidget-".concat(Date.now()));
  const [showSettings, setShowSettings] = useState(false);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const handleClose = useCallback(() => {
    if (library.current) {
      library.current.hide();
    }
    onClose();
  }, [onClose, library]);
  useEffect(() => {
    if (!cloudName || !apiKey) {
      return;
    }
    createMediaLibrary({
      cloudName,
      apiKey,
      inlineContainer: "#".concat(widgetId),
      libraryCreated: lib => {
        library.current = lib;
        const selectedAssets = propsRef.current.selectedAssets;
        const firstSelectedAsset = selectedAssets ? selectedAssets[0] : null;
        const iframe = contentRef.current && contentRef.current.firstChild;
        if (iframe && iframe instanceof HTMLIFrameElement) {
          setLoadingMessage(void 0);
          let asset;
          if (propsRef.current.selectionType === "single" && firstSelectedAsset && firstSelectedAsset.source && firstSelectedAsset.source.id) {
            asset = decodeSourceId(firstSelectedAsset.source.id);
          }
          const folder = asset ? {
            path: asset.public_id.split("/").slice(0, -1).join("/"),
            resource_type: "image"
          } : {
            path: "",
            resource_type: "image"
          };
          if (lib && contentRef.current) {
            lib.show({
              folder,
              asset
            });
            contentRef.current.style.visibility = "visible";
          }
        }
      },
      insertHandler: _ref6 => {
        let {
          assets
        } = _ref6;
        if (!library.current) {
          return;
        }
        const imageAssets = assets.filter(asset => asset.resource_type === "image");
        if (imageAssets.length === 0) {
          throw new Error("The selection did not contain any images.");
        }
        library.current.hide();
        propsRef.current.onSelect(imageAssets.map(asset => {
          const url = asset.derived && asset.derived[0] ? asset.derived[0].secure_url : asset.secure_url;
          return {
            kind: "url",
            value: url,
            assetDocumentProps: {
              _type: "sanity.imageAsset",
              originalFilename: encodeFilename(asset),
              source: {
                id: encodeSourceId(asset),
                name: "cloudinary:".concat(cloudName)
              }
            }
          };
        }));
      }
    });
  }, [cloudName, apiKey, widgetId]);
  const hasConfig = apiKey && cloudName;
  return /* @__PURE__ */jsx(Dialog, {
    id: "cloudinary-asset-source",
    header: "Select image from Cloudinary",
    onClose: handleClose,
    open: true,
    width: 4,
    children: /* @__PURE__ */jsxs(Box, {
      padding: 4,
      children: [showSettings && /* @__PURE__ */jsx(SecretsConfigView, {
        onClose: () => setShowSettings(false)
      }), /* @__PURE__ */jsx(Flex, {
        flex: 1,
        justify: "flex-end",
        children: /* @__PURE__ */jsx(Button, {
          color: "primary",
          icon: PlugIcon,
          mode: "bleed",
          title: "Configure",
          onClick: () => setShowSettings(true),
          tabIndex: 1,
          text: hasConfig ? void 0 : "Configure Cloudinary plugin"
        })
      }), hasConfig && loadingMessage && /* @__PURE__ */jsxs(Stack, {
        space: 3,
        children: [/* @__PURE__ */jsx(Flex, {
          align: "center",
          justify: "center",
          children: /* @__PURE__ */jsx(Spinner, {
            muted: true
          })
        }), /* @__PURE__ */jsx(Text, {
          size: 1,
          muted: true,
          align: "center",
          children: loadingMessage
        })]
      }), /* @__PURE__ */jsx(Widget, {
        style: {
          visibility: "hidden"
        },
        ref: contentRef,
        id: widgetId
      })]
    })
  });
}
const cloudinaryAssetContext = defineType({
  type: "object",
  name: "cloudinary.assetContext",
  fields: [{
    type: "cloudinary.assetContextCustom",
    name: "custom"
  }]
});
const cloudinaryAssetContextCustom = defineType({
  type: "object",
  name: "cloudinary.assetContextCustom",
  fields: [{
    type: "string",
    name: "alt"
  }, {
    type: "string",
    name: "caption"
  }]
});
const AssetListFunctions = props => {
  const {
    onValueCreate,
    onChange
  } = props;
  const {
    secrets,
    loading
  } = useSecrets(namespace);
  const [showSettings, setShowSettings] = React.useState(false);
  const show = useCallback(() => setShowSettings(true), [setShowSettings]);
  const hide = useCallback(() => setShowSettings(false), [setShowSettings]);
  const cloudinaryType = props.schemaType.of.find(t => t.name === cloudinaryAssetSchema.name);
  if (!cloudinaryType) {
    throw new Error("AssetListFunctions can only be used in array.of ".concat(cloudinaryAssetSchema.name, ", but it was array.of\n    ").concat(props.schemaType.of.map(t => t.name)));
  }
  const handleSelect = useCallback(selected => {
    const items = selected.assets.map(asset => Object.assign({}, asset, {
      // Schema version. In case we ever change our schema.
      _version: 1
    }, onValueCreate(cloudinaryType)
    // onValueCreate is mistyped
    ));

    onChange(PatchEvent.from([setIfMissing([]), insert(items, "after", [-1])]));
  }, [onValueCreate, onChange, cloudinaryType]);
  const handleOpenSelector = useCallback(() => secrets && openMediaSelector(secrets.cloudName, secrets.apiKey, true,
  // multi-selection
  handleSelect), [secrets, handleSelect]);
  return /* @__PURE__ */jsxs(Flex, {
    gap: 2,
    flex: 1,
    children: [showSettings && /* @__PURE__ */jsx(SecretsConfigView, {
      onClose: hide
    }), /* @__PURE__ */jsx(Box, {
      flex: 1,
      children: /* @__PURE__ */jsx(ArrayOfObjectsFunctions, {
        ...props
      })
    }), cloudinaryType && /* @__PURE__ */jsxs(Fragment, {
      children: [/* @__PURE__ */jsx(Box, {
        flex: 1,
        children: /* @__PURE__ */jsx(Button, {
          style: {
            width: "100%"
          },
          disabled: props.readOnly || loading,
          mode: "bleed",
          text: "Add multiple",
          onClick: handleOpenSelector
        })
      }), /* @__PURE__ */jsx(Box, {
        children: /* @__PURE__ */jsx(Button, {
          onClick: show,
          icon: PlugIcon,
          mode: "bleed",
          title: "Configure"
        })
      })]
    })]
  });
};
const cloudinarySchemaPlugin = definePlugin({
  name: "cloudinary-schema",
  form: {
    components: {
      input: props => {
        const {
          schemaType
        } = props;
        if (isArrayOfObjectsSchemaType(schemaType)) {
          const arrayProps = props;
          const cloudinaryType = arrayProps.schemaType.of.find(t => t.name === cloudinaryAssetSchema.name);
          if (cloudinaryType) {
            return arrayProps.renderDefault({
              ...arrayProps,
              arrayFunctions: AssetListFunctions
            });
          }
        }
        return props.renderDefault(props);
      }
    }
  },
  schema: {
    types: [cloudinaryAssetSchema, cloudinaryAssetDerivedSchema, cloudinaryAssetContext, cloudinaryAssetContextCustom]
  }
});
const cloudinaryImageSource = {
  name: "cloudinary-image",
  title: "Cloudinary",
  icon: CloudinaryIcon,
  component: CloudinaryAssetSource
};
const cloudinaryAssetSourcePlugin = definePlugin({
  name: "cloudinart-asset-source",
  form: {
    image: {
      assetSources: [cloudinaryImageSource]
    }
  }
});
export { cloudinaryAssetContext, cloudinaryAssetContextCustom, cloudinaryAssetDerivedSchema, cloudinaryAssetSchema, cloudinaryAssetSourcePlugin, cloudinaryImageSource, cloudinarySchemaPlugin };
//# sourceMappingURL=index.esm.js.map
