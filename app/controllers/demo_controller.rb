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
    
    if ('demo' == credentials['username'].downcase) && 
       ('demo' == credentials['password'].downcase)
      session[:uid] = 1
      session[:is_controller] = false
    end
    
    respond_to do |format|
      format.html # FIXME
      format.json { render :json => { :success=> !!session[:uid] } }
    end
  end
  
  def logout
	reset_session
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
    if params[:static]
      redirect_to '/demo/data/wlan.json'
    else
      require "#{Rails.root}/lib/demo/wlan.rb"
      
      respond_to do |format|
        format.html # FIXME should redirect back
        format.json { render :json => WlanData.load_data }
      end
    end
  end
  
  def alert_data
    if params[:static]
      redirect_to "/demo/data/alert-#{params[:type]}.json"
    else
      require "#{Rails.root}/lib/demo/alerts.rb"
      
      respond_to do |format|
        format.html # FIXME should redirect back
        format.json { render :json => AlertData.load_data(params[:type]) }
      end
    end
  end
  
  def kpi_data
    if params[:static]
      redirect_to '/demo/data/kpi.json'
    else
      require "#{Rails.root}/lib/demo/kpi.rb"
      
      respond_to do |format|
        format.html # FIXME should redirect back
        format.json { render :json => KpiData.load_data }
      end
    end
  end
  
end
