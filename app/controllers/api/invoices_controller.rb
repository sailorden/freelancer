class Api::InvoicesController < ApplicationController
  def create
  end
  
  def destroy
  end
  
  def index
    @invoices = current_user.invoices
    render 'index'
  end
  
  def show
    @invoice = Invoice.find(params[:id])
    render 'show'
  end
  
  def update
  end
  
  private
  
  def invoice_params
  end
end
  