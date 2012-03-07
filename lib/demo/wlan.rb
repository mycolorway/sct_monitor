class WlanData
  RID_REGION = 0
  RID_CUR_ONLINE_COUNT = 1
  RID_CUR_IN_RATE = 2
  RID_CUR_OUT_RATE = 3
  RID_ONLINE_COUNT = 4
  RID_TRAFFIC = 34
  
  FILE_PATH = "#{Rails.root}/db/demo/wlan.xls"
  
  def WlanData.load_data()
    book = Spreadsheet.open FILE_PATH
    sheet = book.worksheet 0
    
    avg_online = []
    (RID_ONLINE_COUNT...RID_ONLINE_COUNT+30).each do |cid|
      avg_online.push sheet[1, cid]
    end
    
    avg_traffic = []
    (RID_TRAFFIC...RID_TRAFFIC+30).each do |cid|
      avg_traffic.push sheet[1, cid]
    end
    
    result = []
    fake_id = 1
    sheet.each 2 do |row|
      online = []
      (RID_ONLINE_COUNT...RID_ONLINE_COUNT+30).each do |cid|
        online.push row[cid]
      end
      
      traffic = []
      (RID_TRAFFIC...RID_TRAFFIC+30).each do |cid|
        traffic.push row[cid]
      end
      
      result.push({
        :city => row[RID_REGION],
        :value => row[RID_CUR_ONLINE_COUNT],
        :current_in => row[RID_CUR_IN_RATE],
        :current_out => row[RID_CUR_OUT_RATE],
        :values => online,
        :values2 => traffic,
        :avg1 => avg_online,
        :avg2 => avg_traffic,
        :id => fake_id
      })
      
      fake_id += 1
    end
    
    result
  end
end