import { createHash } from 'node:crypto';

export function validate_config(Config: string) {
  var data;
  var Config_DECODED = Buffer.from(Config, 'base64').toString('utf8');
  try {
    data = JSON.parse(Config_DECODED);
  } catch (err) {
    return false;
  }

  if (!data.hash) {
    return false;
  }

  if (!data.values) {
    return false;
  }

  const hash = createHash('md5')
    .update(JSON.stringify(data.values))
    .digest('base64');

  //console.log(hash)

  if (data.hash != hash) {
    return false;
  }

  return true;
}

export function parse_config(Config: string) {
  var data;
  var Config_DECODED = Buffer.from(Config, 'base64').toString('utf8');
  try {
    data = JSON.parse(Config_DECODED);
  } catch (err) {
    throw new Error('Failed to parse');
  }

  if (!data.hash) {
    throw new Error('No config hash');
  }

  if (!data.values) {
    throw new Error('No Config values');
  }

  const hash = createHash('md5')
    .update(JSON.stringify(data.values))
    .digest('base64');

  console.log('');

  //console.log(hash)

  if (data.hash != hash) {
    throw new Error('Invalid Config hash');
  }

  return data.values;
}

export function make_config(Config: object) {
  let data = {
    hash: createHash('md5').update(JSON.stringify(Config)).digest('base64'),
    values: Config
  };

  const JSON_SAVED = JSON.stringify(data);

  const BASE64_JSON = Buffer.from(JSON_SAVED, 'utf8').toString('base64');

  return BASE64_JSON;
}
