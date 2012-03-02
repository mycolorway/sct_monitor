class KpiData
  RID_TITLE = 0
  RID_CURRENT = 1
  RID_UNIT =2
  RID_RATIO = 3
  RID_MAX = 2
  RID_MIN = 3
  
  FILE_PATH_GAUGE = "#{Rails.root}/db/demo/KPI_gauge.xls"
  FILE_PATH_NUM = "#{Rails.root}/db/demo/KPI_num.xls"
  
  def KpiData.load_gauge_data()
    book = Spreadsheet.open FILE_PATH_GAUGE
    sheet = book.worksheet 0
    results = []
    
    sheet.each 1 do |row|
      next if !row[RID_TITLE] || '' == row[RID_TITLE]
      
      results.push({
        :widget => 'gauge',
        :title => row[RID_TITLE],
        :current => row[RID_CURRENT],
        :unit => '%',
        :ratio => row[RID_RATIO],
        :max => row[RID_MAX],
        :min => row[RID_MIN]
      })
    end
    
    results
  end
  
  def KpiData.load_num_data()
    book = Spreadsheet.open FILE_PATH_NUM
    sheet = book.worksheet 0
    results = []
    
    sheet.each 1 do |row|      
      next if !row[RID_TITLE] || '' == row[RID_TITLE]
      
      results.push({
        :widget => 'number',
        :title => row[RID_TITLE],
        :current => row[RID_CURRENT],
        :unit => row[RID_UNIT],
        :ratio => row[RID_RATIO]
      })
    end
    
    results
  end
  
  def KpiData.load_data()
    fake_id = 0
    return (KpiData.load_num_data + KpiData.load_gauge_data).each do |record|
      record[:id] = fake_id
      fake_id += 1
    end
  end
end