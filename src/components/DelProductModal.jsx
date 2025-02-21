import { useEffect, useRef } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function DelProductModal({
    tempProduct,
    getProducts,
    isOpen,
    setIsOpen
}){

    const delProductModalRef = useRef(null);

    useEffect(()=>{
        new Modal(delProductModalRef.current,{
          backdrop: false
        });
    },[]);

    useEffect(() => {
        if(isOpen){
            const modalInstance = Modal.getInstance(delProductModalRef.current);
            modalInstance.show();
        }
    },[isOpen])

    const handleCloseDelProductModal = () => {
        const modalInstance = Modal.getInstance(delProductModalRef.current);
        modalInstance.hide();
        setIsOpen(false);
    }

    const deleteProduct = async(e) => {
        try {
            const res = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,{
                "data": {
                ...tempProduct,
                origin_price: Number(tempProduct.origin_price),
                price: Number(tempProduct.price),
                is_enabled: tempProduct.is_enabled ? 1 : 0
                }
            });
            console.log(res);
        } catch (error) {
            alert("刪除產品失敗!")
        }
    }  
    
    const handleDeleteProduct = async(e) => {
        try {
            await deleteProduct();
            getProducts();
            handleCloseDelProductModal();
        } catch (error) {
            alert('刪除產品失敗');
        }
    }

    return (
    <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                <h1 className="modal-title fs-5">刪除產品</h1>
                <button
                    onClick={handleCloseDelProductModal}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                ></button>
                </div>
                <div className="modal-body">
                你是否要刪除 
                <span className="text-danger fw-bold">{tempProduct.title}</span>
                </div>
                <div className="modal-footer">
                <button 
                    onClick={handleCloseDelProductModal}
                    type="button"
                    className="btn btn-secondary"
                >
                    取消
                </button>
                <button onClick={handleDeleteProduct} type="button" className="btn btn-danger">
                    刪除
                </button>
                </div>
            </div>
        </div>
    </div>
    );
}

export default DelProductModal;