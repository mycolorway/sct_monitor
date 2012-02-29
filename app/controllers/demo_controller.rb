class DemoController < ApplicationController
  
  before_filter :default_format, :except => :index
  
  private
  def default_format
    request.format = :json if params[:format].nil?
  end
  
  public
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
    end
    
    respond_to do |format|
      format.html
      format.json { render :json => { :success=>!!session[:uid] } }
    end
  end
  
  def wlan_data
    redirect_to '/demo/data/wlan.json'
  end
  
  def alert_data
    redirect_to "/demo/data/alert-#{params[:type]}.json"
  end
  
  def kpi_data
    redirect_to '/demo/data/kpi.json'
  end
  
end
