var mime = require('mime-types');
var xml = require('xml');
var fs = require('fs');

/*

XMLObject
  attributes - xml attributes
  values - hash of key value pairs
  items - array of XMLObjects
  name - name of xml parent
  useCData - whether values should be wrapped in CData tags
  cdataFields - optional; fields that support cdata
*/

/*
options: {
  useCData - boolean indicating whether values should be wrapped in a CData tag
}
 */
function XML(name, xmlItems, attributes, values, options) {
  // name is required
  if (!name) {
    return null;
  }
  var xml = {};
  xml.attributes = attributes;
  xml.values = values;
  xml.items = xmlItems;
  xml.name = name;
  if (options) {
    xml.useCData = options.useCData;
    xml.cdataFields = options.cdataFields;
    // Value overrides values and items
    xml.value = options.value;
  }
  xml.toXML = toXML;
  return xml;
}


function generateXMLObject(rootXML) {

  // Common function for determining xml value, since it's used in multiple places
  function xmlValue(key, value) {
    if (rootXML.useCData && (!rootXML.cdataFields || rootXML.cdataFields.indexOf(key) >= 0)) {
      return  {_cdata:value};
    }
    else {
      return value;
    }
  }

  var xmlArray = [];
  if (rootXML.attributes && Object.keys(rootXML.attributes).length > 0) {
    xmlArray.push({ _attr: rootXML.attributes });
  }
  if (rootXML.value !== undefined) {
    xmlArray.push(xmlValue(null, rootXML.value))
  }
  else {
    if (rootXML.values && Object.keys(rootXML.values).length ) {
      for (var key in rootXML.values) {
        var valueHash = {};
        valueHash[key] = xmlValue(key, rootXML.values[key]);
        xmlArray.push(valueHash);
      }
    }
    if (rootXML.items && rootXML.items.length) {
      rootXML.items.forEach(function(item) {
        xmlArray.push(generateXMLObject(item));
      });
    }
  }

  var xmlObject = {};
  xmlObject[rootXML.name] = xmlArray;
  return xmlObject;
}

function toXML(indent) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + xml(generateXMLObject(this), indent);
}

module.exports = XML;
