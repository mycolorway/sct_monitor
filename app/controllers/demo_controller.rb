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
    
    if 'demo' == credentials['username'] && 'demo' == credentials['password']
      session[:uid] = 1
      session[:is_controller] = false
    end
    
    respond_to do |format|
      format.html # FIXME
      format.json { render :json => { :success=> !!session[:uid] } }
    end
  end
  
  def logout
    session.destroy
    redirect_to :root
  end
  
  def change_order # FIXME
    m_from = Matrix.where(:guid=>params[:from_guid]).first!
    m_to = Matrix.where(:guid=>params[:to_guid]).first!
    
    m_from.order, m_to.order = m_to.order, m_from.order
    
    m_from.save!
    m_to.save!
    
    respond_to do |format|
      format.html # FIXME
      format.json { render :json => { :success=> true } }
    end
  end
  
  def control_on
    session[:is_controller] = true
    
    respond_to do |format|
      format.html # FIXME should redirect back
      format.json { render :json => { :success=> true } }
    end
  end
  
  def control_off
    session[:is_controller] = false
    
    respond_to do |format|
      format.html # FIXME should redirect back
      format.json { render :json => { :success=> true } }
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
