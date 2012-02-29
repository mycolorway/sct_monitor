class CreateMatrices < ActiveRecord::Migration
  def change
    create_table :matrices do |t|
      t.string :guid
      t.string :name
      t.string :template
      t.string :thumb
      t.integer :order

      t.timestamps
    end
  end
end
