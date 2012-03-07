class AlertData
  RID_SOURCE = 0
  RID_TYPE = 1
  RID_LEVEL =2
  RID_CONTENT = 3
  RID_DATETIME = 4
  RID_DURATION = 5
  RID_STATION_TYPE = 6
  
  SOURCE_ALL = 0
  SOURCE_WLAN = 1
  SOURCE_C = 2
  
  FILE_PATH = "#{Rails.root}/db/demo/alert.xls"
  
  def AlertData.source_int2str(source)    
    result = ''
    case source.to_i
    when SOURCE_WLAN
      result = 'wlan'
    when SOURCE_C
      result = 'cnet'
    end
    
    result
  end
  
  def AlertData.load_data(source=SOURCE_ALL)
    book = Spreadsheet.open FILE_PATH
    sheet = book.worksheet 0
    source = AlertData.source_int2str(source)
    
    alerts = []
    fake_id = 1
    l1_num = 0
    l2_num = 0
    l3_num = 0
    sheet.each 1 do |row|
      next if !row[RID_CONTENT] || 0 == row[RID_CONTENT].length
      
      if '' == source || row[RID_SOURCE] == source
        alerts.push({
          :alert_type => row[RID_TYPE],
          :level => row[RID_LEVEL],
          :content => row[RID_CONTENT],
          :time => row[RID_DATETIME],
          :duration => row[RID_DURATION],
          :aid => fake_id,
          :point_type => row[RID_STATION_TYPE]
        })
        
        case row[RID_LEVEL].to_i
        when 1
          l1_num += 1
        when 2
          l2_num += 1
        when 3
          l3_num += 1
        end
        
        fake_id += 1
      end
    end
    
    done_num = (alerts.size * 0.6).ceil
    
    result = {
      :alerts => alerts,
      :chart => [[143,89,34,40,86,18,50,30,54,34,44,22],
                 [40,50,80,30,70,75,60,40,32,43,23,56]],
      :l1_num => l1_num,
      :l2_num => l2_num,
      :l3_num => l3_num,
      :done_num => done_num,
      :undone_num => alerts.size - done_num
    }
  end
end