# usage: rails r script/ws_server_ctrl.rb start

require 'rubygems'
Bundler.require(:default, :websocket_server)
require 'daemons'

Daemons.run File.expand_path('../ws_server.rb', __FILE__)
