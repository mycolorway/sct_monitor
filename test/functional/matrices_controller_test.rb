require 'test_helper'

class MatricesControllerTest < ActionController::TestCase
  setup do
    @matrix = matrices(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:matrices)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create matrix" do
    assert_difference('Matrix.count') do
      post :create, :matrix => @matrix.attributes
    end

    assert_redirected_to matrix_path(assigns(:matrix))
  end

  test "should show matrix" do
    get :show, :id => @matrix
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @matrix
    assert_response :success
  end

  test "should update matrix" do
    put :update, :id => @matrix, :matrix => @matrix.attributes
    assert_redirected_to matrix_path(assigns(:matrix))
  end

  test "should destroy matrix" do
    assert_difference('Matrix.count', -1) do
      delete :destroy, :id => @matrix
    end

    assert_redirected_to matrices_path
  end
end
