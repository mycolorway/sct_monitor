require 'trollop'
require 'eventmachine'
require 'em-websocket'
require 'json'

opts = Trollop::options do
  opt :debug, "Debug mode", :short => 'd'
end

def send_result(socket, success=false, msg='')
  result = {
    :success => success,
    :msg => msg
  }
  
  socket.send(JSON.dump result)
end

EventMachine.run {
  @channels = {}
  @controllers = {}
  
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 1337, :debug => opts[:debug]) do |ws|
    ws.onopen {
      channel = sid = false
      
      ws.onmessage { |msg|
        params = JSON.load(msg)
        
        case params['method']
        when 'register' 
          uid = params['uid'].to_sym    
          @channels[uid] = EM::Channel.new unless @channels.has_key? uid
          channel = @channels[uid]
          sid = channel.subscribe { |msg| ws.send msg }
          
          if params.has_key? 'password' # FIXME
            if @controllers.has_key? channel.object_id
              send_result ws, false, 'already has controller'
            elsif 'demo' == params['password'].downcase
              @controllers[channel.object_id] = sid
              send_result ws, true, 'control on'
            else
              send_result ws, false, 'wrong controller password'
            end
          else
            send_result ws, true
          end
          
        when 'control_on'
          if @controllers.has_key? channel.object_id
            send_result ws, false, 'already has controller'
          elsif (params.has_key? 'password') && 
                ('demo' == params['password'].downcase)
            @controllers[channel.object_id] = sid
            send_result ws, true, 'control on'
          else
            send_result ws, false, 'wrong controller password'
          end
          
        when 'control_off'
          if @controllers[channel.object_id] == sid
            @controllers.delete channel.object_id
            channel.push JSON.dump({
              :success => true,
              :msg => 'control off'
            })
          else
            send_result ws, false, 'you\'re not controller.'
          end
          
        when 'command'
          if sid == @controllers[channel.object_id]
            channel.push JSON.dump(params['data'])
# send_result ws, true
          else
            send_result ws, false, 'this client is not controller'
          end
        end
      }
      
      ws.onclose {
        if channel && sid
          channel.unsubscribe(sid)
          
          if (@controllers.has_key? channel.object_id) && 
             (@controllers[channel.object_id] == sid)
             
            @controllers.delete channel.object_id            
          end
        end
      }
    }
  end
}

