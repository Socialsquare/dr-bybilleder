const assert = require('assert');
const querystring = require('querystring');
const request = require('request-promise');

const DEFAULT_ACCESS_POINT_GUID = process.env.CHAOS_ACCESS_POINT_GUID;

const BASE_URL = 'http://api.danskkulturarv.dk/v4/';
const DKA2_METADATA_SCHEMA_GUID = '5906a41b-feae-48db-bfb7-714b3e105396';
const DEFAULT_GET_OBJECT_QUERY = {
  format: 'json',
  accessPointGUID: DEFAULT_ACCESS_POINT_GUID
};

const chaos = {
  request: (path, query) => {
    assert.ok(path, 'Expected a path');
    if(!query) {
      query = {};
    }
    // Append the query to the querystring
    const url = BASE_URL + path + '?' + querystring.stringify(query);
    // Perform the request
    return request({
      url,
      json: true
    });
  },
  getObjects: (requestedQuery) => {
    // Apply the default get object query.
    const query = Object.assign({}, DEFAULT_GET_OBJECT_QUERY, requestedQuery);
    return chaos.request('Object/Get', query);
  },
  generateVideoQuery: videoReference => {
    const field = 'm' + DKA2_METADATA_SCHEMA_GUID + '_da_all';
    const id = videoReference.videoData.MAitemID;
    return field + ':' + id + ' AND DKA-Organization:DR';
  },
  getVideoFiles: videoReference => {
    const query = chaos.generateVideoQuery(videoReference);
    // Request the object/get
    return chaos.getObjects({
      query,
      pageIndex: 0,
      pageSize: 1,
      includeFiles: true,
      includeMetadata: false,
      includeObjectRelations: false
    }).then(response => {
      const moduleResult = response.ModuleResults.shift();
      const count = moduleResult.TotalCount;
      if(count === null || count === 0) {
        throw new Error('Could not locate the video');
      } else if(count >= 1) {
        const firstResult = moduleResult.Results.shift();
        const files = firstResult.Files;
        const result = {};

        const thumbnailFile = files.find(file => {
          return file.FormatID === 10;
        });
        if(thumbnailFile) {
          result.thumbnail = thumbnailFile.URL;
        }

        const mpegFile = files.find(file => {
          const extension = file.Filename.substring(file.Filename.length-3);
          return extension === 'mp4';
        });
        if(mpegFile) {
          result.rtmpMpeg4 = mpegFile.URL;
        }

        const flvFile = files.find(file => {
          const extension = file.Filename.substring(file.Filename.length-3);
          return extension === 'flv';
        });
        if(flvFile) {
          result.rtmpFlv = flvFile.URL;
        }

        return result;
      } else {
        throw new Error('More than a single object returned, got ' + count);
      }
    });
  }
};

module.exports = chaos;
