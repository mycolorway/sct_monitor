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
  
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 1337, :debug => true) do |ws|
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
          
          if params.has_key? 'password'
            if @controllers.has_key? channel.object_id
              send_result ws, false, 'already has controller'
            elsif 'whosyourdaddy' == params['password']
              @controllers[channel.object_id] = sid
              send_result ws, true
            else
              send_result ws, false, 'wrong controller password'
            end
          else
            send_result ws
          end
          
        when 'control_on'
          if @controllers.has_key? channel.object_id
            send_result ws, false, 'already has controller'
          elsif 'whosyourdaddy' == params['password']
            @controllers[channel.object_id] = sid
            send_result ws, true
          else
            send_result ws, false, 'wrong controller password'
          end
          
        when 'control_off'
            @controllers.delete channel.object_id
            send_result ws, true
          
        when 'command'
          if sid == @controllers[channel.object_id]
            channel.push JSON.dump(params['data'])
            send_result ws, true
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

