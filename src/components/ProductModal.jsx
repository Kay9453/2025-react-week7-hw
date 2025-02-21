import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Modal } from 'bootstrap';
import { useDispatch } from 'react-redux';
import { pushMessage } from '../redux/toastSlice';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({
    modalMode,
    tempProduct,
    isOpen,
    setIsOpen,
    getProducts
}){
    
    const [modalData,setModalData] = useState(tempProduct);
    // console.log(modalData);

    // 當 tempProduct 有更新時，把 modalData 一起更新
    useEffect(() => {
        setModalData({
            ...tempProduct
        })
    },[tempProduct])

    const productModalRef = useRef(null);

    useEffect(()=>{
            new Modal(productModalRef.current,{
            backdrop: false
        });
    },[]);

    useEffect(() => {
        if(isOpen){
            const modalInstance = Modal.getInstance(productModalRef.current);
            modalInstance.show();
        }
    },[isOpen])

    const dispatch = useDispatch();

    const handleCloseProductModal = () => {
        const modalInstance = Modal.getInstance(productModalRef.current);
        modalInstance.hide();
        setIsOpen(false);
    }

    const handleModalInputChange = (e) =>{
        const { value, name, checked, type } = e.target;
        setModalData({
            ...modalData,
            [name]: type === "checkbox" ? checked : value
        })
    }

    const handleImageChange = (e, index) => {
        const { value } = e.target;

        const newImages = [...modalData.imagesUrl];

        newImages[index] = value;

        setModalData({
            ...modalData,
            imagesUrl: newImages
        })

    }
    // 新增圖片
    const handleAddImage = (e) => {
        const newImages = [...modalData.imagesUrl,''];

        setModalData({
            ...modalData,
            imagesUrl: newImages
        })
    }

    // 移除圖片
    const handleRemoveImage = (e) => {
        const newImages = [...modalData.imagesUrl];

        newImages.pop();

        setModalData({
            ...modalData,
            imagesUrl: newImages
        })
    }

    const createProduct = async(e) => {
        try {
          const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
            "data": {
              ...modalData,
              origin_price: Number(modalData.origin_price),
              price: Number(modalData.price),
              is_enabled: modalData.is_enabled ? 1 : 0
            }
          });
          console.log(res);
        //   handleCloseProductModal();
        } catch (error) {
        //   alert("新增產品失敗!")
        // console.log(error.response.data.message);

        const { message } = error.response.data;
        
            dispatch(pushMessage({
                text: message.join("、"),
                status: "failed"
            }))
        }
    }

    const updateProduct = async(e) => {
        try {
          const res = await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,{
            "data": {
              ...modalData,
              origin_price: Number(modalData.origin_price),
              price: Number(modalData.price),
              is_enabled: modalData.is_enabled ? 1 : 0
            }
          });
        
            dispatch(pushMessage({
                text: "編輯產品成功",
                status: "success"
            }))
        } catch (error) {
          alert("編輯產品失敗!")
        }
    }

    const handleUpdateProduct = async() => {
        const apiCall = modalMode === 'create' ? createProduct : updateProduct;
        try {
          await apiCall();
          getProducts();
          handleCloseProductModal();
        } catch (error) {
          alert('更新產品失敗!');
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append('file-to-upload',file);
        
        try {
            const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`,formData);
            const uploadedImageUrl = res.data.imageUrl;
            setModalData({
                ...modalData,
                imageUrl: uploadedImageUrl
            })
        } catch (error) {
            console.error(error);
        }
    }

    return (
    <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
            <h5 className="modal-title fs-4">{modalMode === 'create'? '新增產品': '編輯產品'}</h5>
            <button type="button" onClick={handleCloseProductModal} className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
            <div className="row g-4">
                <div className="col-md-4">
                <div className="mb-5">
                <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                <input
                    value=""
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="form-control"
                    id="fileInput"
                    onChange={handleFileChange}
                />
                </div>
                <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                    主圖
                    </label>
                    <div className="input-group">
                    <input
                        value={modalData.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                    />
                    </div>
                    <img
                    src={modalData.imageUrl}
                    alt={modalData.title}
                    className="img-fluid"
                    />
                </div>

                {/* 副圖 */}
                <div className="border border-2 border-dashed rounded-3 p-3">
                    {modalData.imagesUrl?.map((image, index) => (
                    <div key={index} className="mb-2">
                        <label
                        htmlFor={`imagesUrl-${index + 1}`}
                        className="form-label"
                        >
                        副圖 {index + 1}
                        </label>
                        <input
                        value={image}
                        onChange={ (e) => {
                            handleImageChange(e,index)
                        }}
                        id={`imagesUrl-${index + 1}`}
                        type="text"
                        placeholder={`圖片網址 ${index + 1}`}
                        className="form-control mb-2"
                        />
                        {image && (
                        <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                        />
                        )}
                    </div>
                    ))}
                    <div className="btn-group w-100">
                    { modalData.imagesUrl.length < 5 && modalData.imagesUrl[modalData.imagesUrl.length-1] !== '' && (<button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                    { modalData.imagesUrl.length > 1 && modalData.imagesUrl[modalData.imagesUrl.length-1] !== '' && (<button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                    
                    </div>
                </div>
                </div>

                <div className="col-md-8">
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                    標題
                    </label>
                    <input
                    value={modalData.title}
                    onChange={handleModalInputChange}
                    name="title"
                    id="title"
                    type="text"
                    className="form-control"
                    placeholder="請輸入標題"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                    分類
                    </label>
                    <input
                    value={modalData.category}
                    onChange={handleModalInputChange}
                    name="category"
                    id="category"
                    type="text"
                    className="form-control"
                    placeholder="請輸入分類"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                    單位
                    </label>
                    <input
                    value={modalData.unit}
                    onChange={handleModalInputChange}
                    name="unit"
                    id="unit"
                    type="text"
                    className="form-control"
                    placeholder="請輸入單位"
                    />
                </div>

                <div className="row g-3 mb-3">
                    <div className="col-6">
                    <label htmlFor="origin_price" className="form-label">
                        原價
                    </label>
                    <input
                        value={modalData.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                        min="0"
                    />
                    </div>
                    <div className="col-6">
                    <label htmlFor="price" className="form-label">
                        售價
                    </label>
                    <input
                        value={modalData.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                        min="0"
                    />
                    </div>
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                    產品描述
                    </label>
                    <textarea
                    value={modalData.description}
                    onChange={handleModalInputChange}
                    name="description"
                    id="description"
                    className="form-control"
                    rows={4}
                    placeholder="請輸入產品描述"
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                    說明內容
                    </label>
                    <textarea
                    value={modalData.content}
                    onChange={handleModalInputChange}
                    name="content"
                    id="content"
                    className="form-control"
                    rows={4}
                    placeholder="請輸入說明內容"
                    ></textarea>
                </div>
                <div className={`mb-3 ${(modalData.avgRate === 0 || !modalData.avgRate) && 'd-none'}`}>
                    <label htmlFor="rate" className="form-label">
                        商品評價
                    </label>
                    <div className='d-flex'>
                        <p className='pe-2'>{modalData.avgRate}</p>
                        <span className='text-black-50'>({modalData.rateNum})</span>
                    </div>
                </div>

                <div className="form-check">
                    <input
                    checked={modalData.is_enabled}
                    onChange={handleModalInputChange}
                    name="is_enabled"
                    type="checkbox"
                    className="form-check-input"
                    id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                    是否啟用
                    </label>
                </div>
                </div>
            </div>
            </div>

            <div className="modal-footer border-top bg-light">
            <button type="button" onClick={handleCloseProductModal} className="btn btn-secondary">
                取消
            </button>
            <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
                確認
            </button>
            </div>
        </div>
        </div>
    </div>);
}

export default ProductModal;