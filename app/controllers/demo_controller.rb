class DemoController < ApplicationController
  
  def index
    if session[:uid]
      redirect_to :dashboard
    else
      render :login
    end
  end
  
  def login
    credentials = JSON.load(params[:data])
    
    if 'demo' == credentials['username'] &&
       'demo' == credentials['password']
      session[:uid] = 1
      
      request.format = :json if params[:format].nil?
      
      respond_to do |format|
        format.html
        format.json { render :json => { :success=>true } }
      end
      # redirect_to :dashboard
    # else render
    end
  end

  def dashboard
    @matrixes = []
  end

  def matrix
  end
end
