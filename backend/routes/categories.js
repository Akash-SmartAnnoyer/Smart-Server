const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Category = require('../models/Category');

// Helper function to safely convert string to ObjectId
const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id; // Return as-is if not a valid ObjectId
};

// Get all categories for an org
router.get('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const categories = await Category.find({ orgId, isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single category
router.get('/:orgId/category/:categoryId', async (req, res) => {
  try {
    const { orgId, categoryId } = req.params;
    const category = await Category.findOne({ _id: categoryId, orgId });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create category
router.post('/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const {
      isSubcategory,
      categoryId,
      name,
      description,
      displayOrder = 0,
      ...rest
    } = req.body;

    if (isSubcategory) {
      if (!categoryId) {
        return res.status(400).json({ error: 'categoryId is required for subcategories' });
      }

      const parent = await Category.findOne({ _id: categoryId, orgId });
      if (!parent) {
        return res.status(404).json({ error: 'Parent category not found' });
      }

      const subcategoryId = new mongoose.Types.ObjectId().toString();
      const subcategory = {
        id: subcategoryId,
        name,
        description,
        image: rest.image || null, // Include image if provided
        displayOrder,
      };

      parent.subcategories.push(subcategory);
      parent.updatedAt = new Date();
      await parent.save();

      return res.status(201).json({
        ...subcategory,
        _id: subcategoryId,
        categoryId,
        orgId,
      });
    }

    const categoryData = {
      ...rest,
      name,
      description,
      displayOrder,
      orgId,
      organizationId: rest.organizationId || req.body.organizationId,
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update category
router.put('/:orgId/category/:categoryId', async (req, res) => {
  try {
    const { orgId, categoryId } = req.params;
    const {
      isSubcategory,
      subcategoryId,
      name,
      description,
      displayOrder,
      ...rest
    } = req.body;

    if (isSubcategory || subcategoryId) {
      let parentCategoryId = categoryId;
      let parent = await Category.findOne({ _id: parentCategoryId, orgId });

      // Fallback: if parent not found, try locating by child identifier
      if (!parent) {
        const childId = subcategoryId || categoryId;
        parent = await Category.findOne({ orgId, 'subcategories.id': childId });
        if (parent) {
          parentCategoryId = parent._id.toString();
        }
      }

      if (!parent) {
        return res.status(404).json({ error: 'Parent category not found' });
      }

      const targetId = subcategoryId || categoryId;
      const subcategory = parent.subcategories.find(sub => sub.id === targetId);
      if (!subcategory) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }

      if (typeof name === 'string') subcategory.name = name;
      if (typeof description === 'string') subcategory.description = description;
      if (typeof displayOrder === 'number') subcategory.displayOrder = displayOrder;
      if (rest.image !== undefined) subcategory.image = rest.image; // Update image if provided

      parent.updatedAt = new Date();
      await parent.save();

      return res.json({
        ...subcategory,
        _id: subcategory.id,
        categoryId: parentCategoryId,
        orgId,
      });
    }
    
    const updateData = {
      ...rest,
      name,
      description,
      displayOrder,
      updatedAt: new Date(),
    };
    
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, orgId },
      updateData,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete category
router.delete('/:orgId/category/:categoryId', async (req, res) => {
  try {
    const { orgId, categoryId } = req.params;
    const { subcategoryId } = req.query;

    if (subcategoryId) {
      console.log('Deleting subcategory:', { orgId, categoryId, subcategoryId });
      
      // Try multiple strategies to find the category
      let category = null;
      
      // Strategy 1: Search for any category containing this subcategory (most reliable)
      // This should work even if the provided categoryId is wrong
      console.log('Searching for category by subcategoryId first');
      const allCategories = await Category.find({ orgId });
      for (const cat of allCategories) {
        const hasSubcategory = cat.subcategories.some(sub => {
          const subId = String(sub.id || '');
          const targetId = String(subcategoryId || '');
          return subId === targetId || sub.id === subcategoryId;
        });
        if (hasSubcategory) {
          category = cat;
          console.log('Found category by subcategoryId:', category._id.toString());
          break;
        }
      }
      
      // Strategy 2: Try with categoryId as ObjectId (if not found by subcategoryId)
      if (!category && mongoose.Types.ObjectId.isValid(categoryId)) {
        console.log('Trying to find category by categoryId as ObjectId');
        category = await Category.findOne({ _id: toObjectId(categoryId), orgId });
        if (category) {
          console.log('Found category by ObjectId:', category._id.toString());
        }
      }
      
      // Strategy 3: Try with categoryId as string
      if (!category) {
        console.log('Trying to find category by categoryId as string');
        category = await Category.findOne({ _id: categoryId, orgId });
        if (category) {
          console.log('Found category by string:', category._id.toString());
        }
      }

      if (!category) {
        console.log('Category not found with any strategy');
        console.log('Search parameters:', { orgId, categoryId, subcategoryId });
        // Let's also log what categories exist for debugging
        const allCategories = await Category.find({ orgId }).select('_id name subcategories.id');
        console.log('Available categories:', allCategories.map(c => ({
          _id: c._id.toString(),
          name: c.name,
          subcategoryIds: c.subcategories.map(s => ({ id: s.id, type: typeof s.id }))
        })));
        
        // Also try to find if subcategoryId exists in any category (for debugging)
        const categoriesWithSub = await Category.find({ orgId });
        const foundInCategories = categoriesWithSub.filter(cat => 
          cat.subcategories.some(sub => {
            const subId = String(sub.id || '');
            const targetId = String(subcategoryId || '');
            return subId === targetId || sub.id === subcategoryId;
          })
        );
        if (foundInCategories.length > 0) {
          console.log('Subcategory found in these categories:', foundInCategories.map(c => ({
            _id: c._id.toString(),
            name: c.name
          })));
        }
        
        return res.status(404).json({ error: 'Category or subcategory not found' });
      }

      console.log('Found category:', category._id.toString(), 'Subcategories:', category.subcategories.length);
      console.log('Subcategory IDs in category:', category.subcategories.map(s => s.id));

      // Check if subcategory exists - try multiple matching strategies
      // Sometimes the ID might have slight variations (like last character difference)
      // This can happen due to encoding issues or data inconsistencies
      let matchedSubcategory = null;
      
      // First try exact match
      matchedSubcategory = category.subcategories.find(sub => {
        const subId = String(sub.id || '');
        const targetId = String(subcategoryId || '');
        return subId === targetId || sub.id === subcategoryId;
      });
      
      // If no exact match, try matching without last character (handles encoding issues)
      if (!matchedSubcategory) {
        console.log('Exact match not found, trying match without last character');
        matchedSubcategory = category.subcategories.find(sub => {
          const subId = String(sub.id || '');
          const targetId = String(subcategoryId || '');
          // Match if all but last character are the same
          if (subId.length === targetId.length && subId.length > 0) {
            return subId.slice(0, -1) === targetId.slice(0, -1);
          }
          return false;
        });
        
        if (matchedSubcategory) {
          console.log('Found close match (last character differs):', { 
            requested: subcategoryId, 
            found: matchedSubcategory.id 
          });
        }
      }
      
      if (!matchedSubcategory) {
        console.log('Subcategory not found in category');
        console.log('Looking for:', subcategoryId, 'Type:', typeof subcategoryId);
        console.log('Available subcategory IDs:', category.subcategories.map(s => ({ 
          id: s.id, 
          type: typeof s.id, 
          idString: String(s.id),
          length: String(s.id).length
        })));
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      
      console.log('Subcategory exists, matched ID:', matchedSubcategory.id);

      console.log('Subcategory exists, removing...');
      console.log('Subcategory to delete (requested):', subcategoryId, 'Type:', typeof subcategoryId);
      console.log('Subcategory to delete (matched):', matchedSubcategory.id);

      // Use the exact ID format from the database (the matched one)
      const exactSubcategoryId = matchedSubcategory.id;
      
      // Remove the subcategory using the exact ID format
      const result = await Category.findOneAndUpdate(
        { _id: category._id, orgId },
        {
          $pull: { subcategories: { id: exactSubcategoryId } },
          $set: { updatedAt: new Date() }
        },
        { new: true }
      );

      if (!result) {
        console.log('Failed to update category');
        return res.status(500).json({ error: 'Failed to delete subcategory' });
      }

      // Verify the subcategory was actually removed using the exact ID
      const stillExists = result.subcategories.some(sub => {
        return String(sub.id) === String(exactSubcategoryId);
      });
      
      if (stillExists) {
        console.log('Subcategory still exists after deletion attempt, trying manual removal');
        console.log('Remaining subcategories:', result.subcategories.map(s => ({ id: s.id, type: typeof s.id })));
        // Try manual removal as fallback
        result.subcategories = result.subcategories.filter(sub => String(sub.id) !== String(exactSubcategoryId));
        result.updatedAt = new Date();
        const manualResult = await result.save();
        if (manualResult.subcategories.some(sub => String(sub.id) === String(exactSubcategoryId))) {
          console.log('Manual removal also failed');
          return res.status(500).json({ error: 'Failed to delete subcategory' });
        }
        console.log('Subcategory deleted via manual removal');
        return res.json({ message: 'Subcategory deleted successfully' });
      }

      console.log('Subcategory deleted successfully');
      return res.json({ message: 'Subcategory deleted successfully' });
    }
    
    const category = await Category.findOneAndUpdate(
      { _id: categoryId, orgId },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

