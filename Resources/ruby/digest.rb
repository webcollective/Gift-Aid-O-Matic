require 'digest/sha1'
require 'digest/md5'
require 'base64'
def calculate_irmark(str)
  digest = Digest::SHA1.digest(str)
  return Base64.encode64(digest).gsub(/\n/,'')
end
def hash_password(str)
  digest = Digest::MD5.digest(str.downcase)
  return Base64.encode64(digest).gsub(/\n/,'')
end